import { CommandResponses } from "@app/templates"
import { ChatCommandContext } from ".."

export const command = "*"
export const describe = ""
export const builder = {}

export function handler(context: ChatCommandContext): void {
  context.respond(CommandResponses.unrecognized, true)
}
