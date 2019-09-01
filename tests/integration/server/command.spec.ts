import axios from "axios"
import MockAdapter from "axios-mock-adapter"
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
  data_directory: "tests/data",
}))

const testSgid = "--0000000000000000000000000000000000c0ffee"

function basecampChatUrl(urlNumber: number): string {
  return `https://3.basecamp.com/0/integrations/a/buckets/0/chats/${urlNumber}/lines`
}

function testCommand(urlNumber: number, command: string): request.Test {
  const payload = {
    command,
    creator: {
      attachable_sgid: testSgid,
    },
    callback_url: basecampChatUrl(urlNumber),
  }

  return request(server)
    .post("/command")
    .query({ access_key: "access-key" })
    .send(payload)
    .end(() => {})
}

const axiosMock = new MockAdapter(axios)

const errorHandler = jest.fn((err, req, res, next) => next())
server.use(errorHandler)

beforeEach(() => {
  fs.copyFileSync("tests/data/database.test.json", "tests/data/database.json")
  database.reload()

  axiosMock.reset()
  axiosMock.resetHistory()

  errorHandler.mockClear()
})

describe("POST /command", () => {
  it("should do nothing with an invalid access key", done => {
    request(server)
      .post("/command")
      .query({ access_key: "invalid-key" })
      .end(() => {
        expect(errorHandler).toHaveBeenCalled()
        const message = errorHandler.mock.calls[0][0].message
        expect(message).toContain("invalid access key")

        done()
      })
  })

  describe("fail", () => {
    it("should send an error message with a mention if an invalid command is issued", done => {
      axiosMock.onPost().reply(config => {
        const content = JSON.parse(config.data).content
        const root = HTMLParser.parse(content)
        const attachment = root.querySelector("bc-attachment")

        expect(content).toContain("unrecognized")
        expect(attachment).toHaveProperty("attributes.sgid")
        expect(attachment.attributes.sgid).toEqual(testSgid)

        done()
        return [201]
      })

      testCommand(0, "bogus command")
    })
  })

  describe("help", () => {
    it("should send a help message with a mention", done => {
      axiosMock.onPost().reply(config => {
        const content = JSON.parse(config.data).content
        const root = HTMLParser.parse(content)
        const attachment = root.querySelector("bc-attachment")

        expect(content).toContain("help")
        expect(attachment).toHaveProperty("attributes.sgid")
        expect(attachment.attributes.sgid).toEqual(testSgid)

        done()
        return [201]
      })

      testCommand(0, "help")
    })
  })

  describe("list", () => {
    it("should return a list of subscribed repositories", done => {
      axiosMock.onPost().reply(config => {
        const content = JSON.parse(config.data).content
        expect(content).toContain("repo-B")
        expect(content).toContain("repo-C")

        done()
        return [201]
      })

      testCommand(1, "list")
    })

    it("should return the prepared message when no repositories are subscribed to", done => {
      axiosMock.onPost().reply(config => {
        const content = JSON.parse(config.data).content
        expect(content).toEqual("list_empty")

        done()
        return [201]
      })

      testCommand(3, "list")
    })
  })

  describe("subscribe", () => {
    it("should successfully add a database entry", done => {
      axiosMock.onPost().reply(requestConfig => {
        const content = JSON.parse(requestConfig.data).content
        expect(content).toEqual(
          `subscribed:${config.github_organization}/repo-Z`
        )
        expect(database.getRepositoriesByChat(basecampChatUrl(4))).toEqual([
          "repo-Z",
        ])

        done()
        return [201]
      })

      expect(database.getRepositoriesByChat(basecampChatUrl(4))).toEqual([])
      testCommand(4, "subscribe repo-Z")
    })
  })

  describe("unsubscribe", () => {
    it("should successfully remove database entry", done => {
      axiosMock.onPost().reply(requestConfig => {
        const content = JSON.parse(requestConfig.data).content
        expect(content).toEqual(
          `unsubscribed:${config.github_organization}/repo-B`
        )
        expect(
          database.getRepositoriesByChat(basecampChatUrl(1))
        ).not.toContain("repo-B")

        done()
        return [201]
      })

      expect(database.getRepositoriesByChat(basecampChatUrl(1))).toContain(
        "repo-B"
      )
      testCommand(1, "unsubscribe repo-B")
    })

    it("should return the prepared message when the repository is not subscribed to", done => {
      axiosMock.onPost().reply(config => {
        const content = JSON.parse(config.data).content
        const root = HTMLParser.parse(content)
        const attachment = root.querySelector("bc-attachment")

        expect(content).toContain("unsubscribe_fail")
        expect(attachment).toHaveProperty("attributes.sgid")
        expect(attachment.attributes.sgid).toEqual(testSgid)

        expect(
          database.getRepositoriesByChat(basecampChatUrl(0))
        ).not.toContain("repo-B")

        done()
        return [201]
      })

      expect(database.getRepositoriesByChat(basecampChatUrl(0))).not.toContain(
        "repo-B"
      )
      testCommand(0, "unsubscribe repo-B")
    })
  })
})

afterAll(() => {
  fs.unlinkSync("tests/data/database.json")
})
