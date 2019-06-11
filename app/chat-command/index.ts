import yargs from "yargs"

import { SendBasecampDefaultError } from "@app/basecamp-chat"

import * as commands from "./modules"

type BasecampCommandPayload = {
  command: string
  creator: {
    attachable_sgid: string
  }
  callback_url: string
}

export type ChatCommandArguments = {
  userId: string
  responseUrl: string
  [key: string]: any
}

const ChatCommandParser = yargs
  .command(commands.fail)
  .command(commands.help)
  .command(commands.subscribe)
  .command(commands.unsubscribe)
  .command(commands.list)
  .help(false)

export async function ParseBasecampPayload(
  payload: BasecampCommandPayload
): Promise<void> {
  const command: string = payload.command
  const userId: string = (payload.creator || {}).attachable_sgid
  const responseUrl: string = payload.callback_url

  // Validate payload
  if (
    typeof command !== "string" ||
    typeof userId !== "string" ||
    typeof responseUrl !== "string"
  ) {
    return
  }

  // Split on ALL whitespace
  const args: string[] = command.match(/\S+/g) || []
  ChatCommandParser.parse(args, { responseUrl, userId }, err => {
    if (err) {
      SendBasecampDefaultError(responseUrl, userId)
    }
  })
}
