import ejs from "ejs"

import config from "@app/config"
import db from "@app/database"
import { CommandResponses } from "@app/templates"
import { ChatCommandContext } from ".."

export const command = "unsubscribe <repo>"
export const describe = ""
export const builder = {}

export function handler(context: ChatCommandContext): void {
  const repositories = db.getRepositoriesByChat(context.chatUrl)

  if (repositories.includes(context.repo)) {
    db.removeRepositoryFromChat(context.repo, context.chatUrl)
    context.respond(
      ejs.render(CommandResponses.unsubscribe, {
        repo: context.repo,
        organization: config.github_organization,
      })
    )
  } else {
    context.respond(
      ejs.render(CommandResponses.unsubscribe_fail, {
        repo: context.repo,
      }),
      true
    )
  }
}
