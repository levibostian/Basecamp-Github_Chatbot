import axios from "axios"

import config from "@app/config"

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
      { headers: { "User-Agent": config.basecamp_user_agent } }
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
  SendBasecampChat(chatUrl, config.messages.unrecognized, userId)
}
