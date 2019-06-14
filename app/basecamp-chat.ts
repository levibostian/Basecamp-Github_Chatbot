import axios from "axios"

import { responses } from "@app/templates"

function attachBasecampUserMention(message: string, userId: string): string {
  return `<bc-attachment sgid="${userId}"></bc-attachment>, ${message}`
}

export function SendBasecampChat(
  chatUrl: string,
  message: string,
  userId?: string
): void {
  if (userId) {
    message = attachBasecampUserMention(message, userId)
  }

  axios
    .post(
      chatUrl,
      { content: message },
      { headers: { "User-Agent": process.env.BASECAMP_USER_AGENT } }
    )
    .catch(err => {
      throw Error(
        `Failed to POST ${message} to ${chatUrl}\n${err}\n${err.stack}`
      )
    })
}

export function SendBasecampDefaultError(
  chatUrl: string,
  userId: string
): void {
  SendBasecampChat(chatUrl, responses.unrecognized, userId)
}
