import ejs from "ejs"

import db from "@app/database"
import responses from "@app/responses"

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
      ejs.render(responses.list_repos, { repositories })
    )
  } else {
    SendBasecampChat(args.responseUrl, responses.list_empty)
  }
}
