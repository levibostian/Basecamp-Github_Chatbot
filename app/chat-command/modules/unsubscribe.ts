import ejs from "ejs"

import config from "@app/config"
import db from "@app/database"

import { SendBasecampChat } from "@app/basecamp-chat"
import { ChatCommandArguments } from ".."

export const command = "unsubscribe <repo>"
export const describe = ""
export const builder = {}

export function handler(args: ChatCommandArguments): void {
  const repositories = db.getRepositoriesByChat(args.responseUrl)

  if (repositories.includes(args.repo)) {
    db.removeRepositoryFromChat(args.repo, args.responseUrl)
    SendBasecampChat(
      args.responseUrl,
      ejs.render(config.messages.unsubscribe, { repo: args.repo })
    )
  } else {
    SendBasecampChat(
      args.responseUrl,
      ejs.render(config.messages.unsubscribe_fail, { repo: args.repo }),
      args.userId // this is an error, so @creator
    )
  }
}
