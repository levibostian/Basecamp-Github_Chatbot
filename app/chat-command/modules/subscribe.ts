import ejs from "ejs"

import db from "@app/database"

import { SendBasecampChat } from "@app/basecamp-chat"
import { responses } from "@app/templates"
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
      organization: process.env.GITHUB_ORGANIZATION,
    })
  )
}
