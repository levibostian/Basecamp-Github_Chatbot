import { SendBasecampChat } from "@app/basecamp-chat"
import { CommandResponses } from "@app/templates"
import { ChatCommandArguments } from ".."

export const command = "help"
export const describe = ""
export const builder = {}

export function handler(args: ChatCommandArguments): void {
  SendBasecampChat(args.responseUrl, CommandResponses.help, args.userId)
}
