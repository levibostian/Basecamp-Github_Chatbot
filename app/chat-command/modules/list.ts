import ejs from "ejs"

import db from "@app/database"
import { CommandResponses } from "@app/templates"
import { ChatCommandContext } from ".."

export const command = "list"
export const describe = ""
export const builder = {}

export async function handler(context: ChatCommandContext): Promise<void> {
  const repositories = await db.getRepositoriesByChat(context.chatUrl)
  if (repositories.length) {
    context.respond(ejs.render(CommandResponses.list_repos, { repositories }))
  } else {
    context.respond(CommandResponses.list_empty)
  }
}
