import config from "@app/config"

import { SendBasecampChat } from "@app/basecamp-chat"
import { ChatCommandArguments } from ".."

export const command = "help"
export const describe = ""
export const builder = {}

export function handler(args: ChatCommandArguments): void {
  SendBasecampChat(args.responseUrl, config.messages.help, args.userId)
}
