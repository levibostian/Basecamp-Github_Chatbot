import ejs from "ejs"

import config from "@app/config"
import db from "@app/database"

import { SendBasecampChat } from "@app/basecamp-chat"
import { ChatCommandArguments } from ".."

export const command = "subscribe <repo>"
export const describe = ""
export const builder = {}

export function handler(args: ChatCommandArguments): void {
  db.addSubscription(args.repo, args.responseUrl)
  SendBasecampChat(
    args.responseUrl,
    ejs.render(config.messages.subscribe, { repo: args.repo })
  )
}
