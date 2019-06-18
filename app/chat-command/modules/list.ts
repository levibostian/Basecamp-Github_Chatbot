import ejs from "ejs"

import db from "@app/database"

import { SendBasecampChat } from "@app/basecamp-chat"
import { CommandResponses } from "@app/templates"
import { ChatCommandArguments } from ".."

export const command = "list"
export const describe = ""
export const builder = {}

export function handler(args: ChatCommandArguments): void {
  const repositories = db.getRepositoriesByChat(args.responseUrl)
  if (repositories.length) {
    SendBasecampChat(
      args.responseUrl,
      ejs.render(CommandResponses.list_repos, { repositories })
    )
  } else {
    SendBasecampChat(args.responseUrl, CommandResponses.list_empty)
  }
}
