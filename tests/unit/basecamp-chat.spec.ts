import axios from "axios"
import MockAdapter from "axios-mock-adapter"

const HTMLParser = require("node-html-parser")

import { SendBasecampChat } from "@app/basecamp-chat"

const axiosMock = new MockAdapter(axios)

describe("SendBasecampChat", () => {
  beforeEach(() => {
    axiosMock.reset()
  })

  it("should POST to the chat url with proper parameters", done => {
    const chatUrl = "chat_url"
    const message = "test_message"

    axiosMock.onPost(chatUrl).reply(config => {
      expect(config.url).toEqual(chatUrl)
      expect(JSON.parse(config.data)).toEqual({
        content: message,
      })
      expect(config.headers).toHaveProperty("User-Agent")

      return [201]
    })

    SendBasecampChat(chatUrl, message).then(() => done())
  })

  it("should attach user mentions properly", done => {
    const chatUrl = "chat_url"
    const message = "test_message"
    const userId = "test_user_id"

    axiosMock.onPost(chatUrl).reply(config => {
      const content = JSON.parse(config.data).content
      const root = HTMLParser.parse(content)
      const attachment = root.querySelector("bc-attachment")

      expect(content).toContain(message)
      expect(attachment).toHaveProperty("attributes.sgid")
      expect(attachment.attributes.sgid).toEqual(userId)

      return [201]
    })

    SendBasecampChat(chatUrl, message, userId).then(() => done())
  })

  it("should throw a descriptive error when the network call fails", done => {
    const chatUrl = "chat_url"
    const message = "test_message"

    axiosMock.onPost(chatUrl).networkError()

    SendBasecampChat(chatUrl, message).catch(err => {
      expect(err).toHaveProperty("message")
      expect(err.message).toContain(chatUrl)
      expect(err.message).toContain(message)
      done()
    })
  })
})
