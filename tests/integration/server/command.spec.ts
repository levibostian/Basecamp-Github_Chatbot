import fs from "fs"
import request from "supertest"

const HTMLParser = require("node-html-parser")

import config from "@app/config"
import database from "@app/database"
import server from "@app/server"

jest.mock("@app/config", () => ({
  basecamp_access_key: "access-key",
  basecamp_user_agent: "test-ua",
  github_organization: "test-org",
  template_file: "tests/data/templates.json",
  database_file: "tests/data/database.json",
}))

const testSgid = "--0000000000000000000000000000000000c0ffee"

function basecampChatUrl(urlNumber: number): string {
  return `https://3.basecamp.com/0/integrations/a/buckets/0/chats/${urlNumber}/lines`
}

function testCommand(urlNumber: number, command: string): request.Test {
  const payload = {
    command,
    creator: { attachable_sgid: testSgid },
    callback_url: basecampChatUrl(urlNumber),
  }

  return request(server)
    .post("/command")
    .query({ access_key: "access-key" })
    .send(payload)
    .expect("Content-Type", /text\/html/)
    .expect(200)
}

function expectMention(content: string): void {
  const root = HTMLParser.parse(content)
  const attachment = root.querySelector("bc-attachment")

  expect(attachment).toHaveProperty("attributes.sgid")
  expect(attachment.attributes.sgid).toEqual(testSgid)
}

const errorHandler = jest.fn((err, req, res, next) => next())
server.use(errorHandler)

beforeEach(() => {
  fs.copyFileSync("tests/data/database.test.json", "tests/data/database.json")
  database.load()

  errorHandler.mockClear()
})

afterAll(() => {
  fs.unlinkSync("tests/data/database.json")
})

describe("POST /command", () => {
  it("should do nothing with an invalid access key", async () => {
    await request(server)
      .post("/command")
      .query({ access_key: "invalid-key" })
      .expect(204)

    expect(errorHandler).toHaveBeenCalled()
    const message = errorHandler.mock.calls[0][0].message
    expect(message).toContain("invalid access key")
  })

  describe("fail", () => {
    it("should send an error message with a mention if an invalid command is issued", async () => {
      const response = await testCommand(0, "bogus command")
      expectMention(response.text)
      expect(response.text).toContain("unrecognized")
    })
  })

  describe("help", () => {
    it("should send a help message with a mention", async () => {
      const response = await testCommand(0, "help")
      expectMention(response.text)
      expect(response.text).toContain("help")
    })
  })

  describe("list", () => {
    it("should return a list of subscribed repositories", async () => {
      const response = await testCommand(1, "list")
      expect(response.text).toContain("repo-B")
      expect(response.text).toContain("repo-C")
    })

    it("should return the prepared message when no repositories are subscribed to", async () => {
      const response = await testCommand(3, "list")
      expect(response.text).toEqual("list_empty")
    })
  })

  describe("subscribe", () => {
    it("should successfully add a database entry", async () => {
      expect(await database.getRepositoriesByChat(basecampChatUrl(4))).toEqual(
        []
      )
      const response = await testCommand(4, "subscribe repo-Z")
      expect(response.text).toEqual(
        `subscribed:${config.github_organization}/repo-Z`
      )
      expect(await database.getRepositoriesByChat(basecampChatUrl(4))).toEqual([
        "repo-Z",
      ])
    })
  })

  describe("unsubscribe", () => {
    it("should successfully remove database entry", async () => {
      expect(
        await database.getRepositoriesByChat(basecampChatUrl(1))
      ).toContain("repo-B")
      const response = await testCommand(1, "unsubscribe repo-B")
      expect(response.text).toEqual(
        `unsubscribed:${config.github_organization}/repo-B`
      )
      expect(
        await database.getRepositoriesByChat(basecampChatUrl(1))
      ).not.toContain("repo-B")
    })

    it("should return the prepared message when the repository is not subscribed to", async () => {
      expect(
        await database.getRepositoriesByChat(basecampChatUrl(0))
      ).not.toContain("repo-B")
      const response = await testCommand(0, "unsubscribe repo-B")
      expectMention(response.text)
      expect(response.text).toContain("unsubscribe_fail")
      expect(
        await database.getRepositoriesByChat(basecampChatUrl(0))
      ).not.toContain("repo-B")
    })
  })
})
