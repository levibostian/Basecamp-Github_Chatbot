import ejs from "ejs"

import config from "@app/config"
import db from "@app/database"
import { CommandResponses } from "@app/templates"
import { ChatCommandContext } from ".."

export const command = "subscribe <repo>"
export const describe = ""
export const builder = {}

export async function handler(context: ChatCommandContext): Promise<void> {
  await db.addRepositoryToChat(context.repo, context.chatUrl)
  context.respond(
    ejs.render(CommandResponses.subscribe, {
      repo: context.repo,
      organization: config.github_organization,
    })
  )
}
