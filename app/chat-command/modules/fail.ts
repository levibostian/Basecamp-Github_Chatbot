import { SendBasecampDefaultError } from "@app/basecamp-chat"
import { ChatCommandArguments } from ".."

export const command = "*"
export const describe = ""
export const builder = {}

export function handler(args: ChatCommandArguments): void {
  SendBasecampDefaultError(args.responseUrl, args.userId)
}
