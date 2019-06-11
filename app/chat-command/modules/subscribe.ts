import ejs from "ejs"

import config from "@app/config"
import db from "@app/database"
import responses from "@app/responses"

import { SendBasecampChat } from "@app/basecamp-chat"
import { ChatCommandArguments } from ".."

export const command = "subscribe <repo>"
export const describe = ""
export const builder = {}

export function handler(args: ChatCommandArguments): void {
  db.addRepositoryToChat(args.repo, args.responseUrl)
  SendBasecampChat(
    args.responseUrl,
    ejs.render(responses.subscribe, {
      repo: args.repo,
      organization: config.organization,
    })
  )
}
