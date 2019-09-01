import axios from "axios"
import MockAdapter from "axios-mock-adapter"
import crypto from "crypto"
import fs from "fs"
import request from "supertest"

import config from "@app/config"
import server from "@app/server"
import database from "@app/database"

jest.mock("@app/config", () => ({
  basecamp_access_key: "access-key",
  basecamp_user_agent: "test-ua",
  github_organization: "test-org",
  github_hmac_secret: "abcde00000000000000000000000000000000000",
  data_directory: "tests/data",
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
  database.reload()

  axiosMock.reset()
  axiosMock.resetHistory()
  axiosMock.onPost().reply(201)
})

describe("POST /hook", () => {
  describe("HMAC verification", () => {
    it("should fail if no HMAC signature is supplied", done => {
      testPayload("repo-A", "test_event_0", {})
        .unset("X-Hub-Signature")
        .end((err, res) => {
          expect(res.status).toBe(204)
          expect(axiosMock.history.post).toHaveLength(0)
          done()
        })
    })

    it("should fail if the HMAC signature does not match", done => {
      testPayload("repo-A", "test_event_0", {})
        .set("X-Hub-Signature", "mismatch")
        .end((err, res) => {
          expect(res.status).toBe(204)
          expect(axiosMock.history.post).toHaveLength(0)
          done()
        })
    })
  })

  it("should return 404 if Github event header is not present", done => {
    testPayload("repo-A", "test_event_0", {})
      .unset("X-GitHub-Event")
      .end((err, res) => {
        expect(res.status).toBe(404)
        expect(axiosMock.history.post).toHaveLength(0)
        done()
      })
  })

  describe("valid payloads", () => {
    it("should notify the proper chats when called with a valid payload", done => {
      testPayload("repo-A", "test_event_0", {}).end((err, res) => {
        expect(res.status).toBe(204)
        expect(axiosMock.history.post).toHaveLength(1)

        const data = JSON.parse(axiosMock.history.post[0].data)
        expect(data.content).toEqual("test_event_0")
        done()
      })
    })

    it("should notify all subscribed chats when called with a valid payload", done => {
      testPayload("repo-C", "test_event_0", {}).end((err, res) => {
        expect(res.status).toBe(204)
        expect(axiosMock.history.post).toHaveLength(2)
        axiosMock.history.post.forEach(p => {
          expect(JSON.parse(p.data).content).toEqual("test_event_0")
        })
        done()
      })
    })
  })

  describe("templates", () => {
    it("should render properly (1)", done => {
      const payload = {
        action: "action_0",
        property_0: "eggs",
        property_1: "ham",
      }

      testPayload("repo-A", "test_event_1", payload).end((err, res) => {
        expect(res.status).toBe(204)
        expect(axiosMock.history.post).toHaveLength(1)

        const data = JSON.parse(axiosMock.history.post[0].data)
        expect(data.content).toEqual("constant ham")
        done()
      })
    })

    it("should render properly (2)", done => {
      const payload = {
        action: "action_1",
        property_0: "eggs",
        property_1: "ham",
      }

      testPayload("repo-A", "test_event_1", payload).end((err, res) => {
        expect(res.status).toBe(204)
        expect(axiosMock.history.post).toHaveLength(1)

        const data = JSON.parse(axiosMock.history.post[0].data)
        expect(data.content).toEqual("eggs")
        done()
      })
    })

    it("should fail when no action matches", done => {
      const payload = {
        action: "action_bogus",
        property_0: "eggs",
        property_1: "ham",
      }

      testPayload("repo-A", "test_event_1", payload).end((err, res) => {
        expect(res.status).toBe(404)
        expect(axiosMock.history.post).toHaveLength(0)
        done()
      })
    })
  })

  describe("handled events", () => {
    it("should rename repositories in the database", done => {
      expect(database.getChatsByRepository("repo-A")).toHaveLength(1)
      expect(database.getChatsByRepository("repo-A-new")).toHaveLength(0)

      const payload = {
        action: "renamed",
        changes: {
          repository: { name: { from: "repo-A" } },
        },
      }
      testPayload("repo-A-new", "repository", payload).end(() => {
        expect(database.getChatsByRepository("repo-A")).toHaveLength(0)
        expect(database.getChatsByRepository("repo-A-new")).toHaveLength(1)
        done()
      })
    })

    it("should delete repositories in the database", done => {
      expect(database.getChatsByRepository("repo-A")).toHaveLength(1)

      testPayload("repo-A", "repository", { action: "deleted" }).end(() => {
        expect(database.getChatsByRepository("repo-A")).toHaveLength(0)
        done()
      })
    })
  })
})

afterAll(() => {
  fs.unlinkSync("tests/data/database.json")
})
