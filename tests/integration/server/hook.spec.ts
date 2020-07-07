import axios from "axios"
import MockAdapter from "axios-mock-adapter"
import crypto from "crypto"
import fs from "fs"
import request from "supertest"

import config from "@app/config"
import server from "@app/server"
import database from "@app/database"
import { responses } from "@app/responses"

jest.mock("@app/config", () => ({
  basecamp_access_key: "access-key",
  basecamp_user_agent: "test-ua",
  github_organization: "test-org",
  github_hmac_secret: "abcde00000000000000000000000000000000000",
  template_file: "tests/data/templates.json",
  database_file: "tests/data/database.json",
}))

function testPayload(
  repository: string | undefined,
  event: string,
  payload: any
): request.Test {
  const repositoryPayload = repository
    ? {
        repository: { name: repository },
      }
    : {}

  const data = JSON.stringify({ ...payload, ...repositoryPayload })
  const hmac = crypto.createHmac("sha1", config.github_hmac_secret)
  const signature = "sha1=" + hmac.update(data).digest("hex")

  return request(server)
    .post("/hook")
    .set("X-Hub-Signature", signature)
    .set("X-GitHub-Event", event)
    .set("Content-Type", "application/json")
    .send(data)
}

const axiosMock = new MockAdapter(axios)

beforeEach(() => {
  fs.copyFileSync("tests/data/database.test.json", "tests/data/database.json")
  database.load()

  axiosMock.reset()
  axiosMock.resetHistory()
  axiosMock.onPost().reply(201)
})

afterAll(() => {
  fs.unlinkSync("tests/data/database.json")
})

describe("POST /hook", () => {
  describe("HMAC verification", () => {
    it("should fail if no HMAC signature is supplied", async () => {
      await testPayload("repo-A", "test_event_0", {})
        .unset("X-Hub-Signature")
        .expect(responses.empty.code)

      expect(axiosMock.history.post).toHaveLength(0)
    })

    it("should fail if the HMAC signature does not match", async () => {
      await testPayload("repo-A", "test_event_0", {})
        .set("X-Hub-Signature", "mismatch")
        .expect(responses.empty.code)

      expect(axiosMock.history.post).toHaveLength(0)
    })
  })

  it("should return 404 if Github event header is not present", async () => {
    await testPayload("repo-A", "test_event_0", {})
      .unset("X-GitHub-Event")
      .expect(responses.missing_event.code)

    expect(axiosMock.history.post).toHaveLength(0)
  })

  describe("valid payloads", () => {
    it("should notify the proper chats when called with a valid payload", async () => {
      await testPayload("repo-A", "test_event_0", {}).expect(
        responses.event_handled.code
      )

      expect(axiosMock.history.post).toHaveLength(1)
      const data = JSON.parse(axiosMock.history.post[0].data)
      expect(data.content).toEqual("test_event_0")
    })

    it("should notify all subscribed chats when called with a valid payload", async () => {
      await testPayload("repo-C", "test_event_0", {}).expect(
        responses.event_handled.code
      )

      expect(axiosMock.history.post).toHaveLength(2)
      axiosMock.history.post.forEach((p) => {
        expect(JSON.parse(p.data).content).toEqual("test_event_0")
      })
    })
  })

  describe("templates", () => {
    it("should render properly (1)", async () => {
      const payload = {
        action: "action_0",
        property_0: "eggs",
        property_1: "ham",
      }

      await testPayload("repo-A", "test_event_1", payload).expect(
        responses.event_handled.code
      )

      expect(axiosMock.history.post).toHaveLength(1)
      const data = JSON.parse(axiosMock.history.post[0].data)
      expect(data.content).toEqual("constant ham")
    })

    it("should render properly (2)", async () => {
      const payload = {
        action: "action_1",
        property_0: "eggs",
        property_1: "ham",
      }

      await testPayload("repo-A", "test_event_1", payload).expect(
        responses.event_handled.code
      )

      expect(axiosMock.history.post).toHaveLength(1)
      const data = JSON.parse(axiosMock.history.post[0].data)
      expect(data.content).toEqual("eggs")
    })

    it("should fail when no action matches", async () => {
      const payload = {
        action: "action_bogus",
        property_0: "eggs",
        property_1: "ham",
      }

      await testPayload("repo-A", "test_event_1", payload).expect(
        responses.translation_error.code
      )
      expect(axiosMock.history.post).toHaveLength(0)
    })
  })

  describe("handled events", () => {
    it("should rename repositories in the database", async () => {
      expect(await database.getChatsByRepository("repo-A")).toHaveLength(1)
      expect(await database.getChatsByRepository("repo-A-new")).toHaveLength(0)

      const payload = {
        action: "renamed",
        changes: {
          repository: { name: { from: "repo-A" } },
        },
      }

      await testPayload("repo-A-new", "repository", payload)
      expect(await database.getChatsByRepository("repo-A")).toHaveLength(0)
      expect(await database.getChatsByRepository("repo-A-new")).toHaveLength(1)
    })

    it("should delete repositories in the database", async () => {
      expect(await database.getChatsByRepository("repo-A")).toHaveLength(1)
      await testPayload("repo-A", "repository", { action: "deleted" })
      expect(await database.getChatsByRepository("repo-A")).toHaveLength(0)
    })
  })
})
