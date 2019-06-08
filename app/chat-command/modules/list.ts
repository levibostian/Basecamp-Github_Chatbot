import ejs from "ejs"

import config from "@app/config"
import db from "@app/database"

import { SendBasecampChat } from "@app/basecamp-chat"
import { ChatCommandArguments } from ".."

export const command = "list"
export const describe = ""
export const builder = {}

export function handler(args: ChatCommandArguments): void {
  const repositories = db.getRepositoriesByChat(args.responseUrl)
  if (repositories.length) {
    SendBasecampChat(
      args.responseUrl,
      ejs.render(config.messages.list_repos, { repositories })
    )
  } else {
    SendBasecampChat(args.responseUrl, config.messages.list_empty)
  }
}
