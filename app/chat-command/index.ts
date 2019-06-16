import { Validator } from "jsonschema"
import yargs from "yargs"

import { SendBasecampDefaultError } from "@app/basecamp-chat"

import BasecampCommandPayloadSchema from "./basecamp-payload.schema.json"
import * as commands from "./modules"

interface BasecampCommandPayload {
  command: string
  creator: {
    attachable_sgid: string
  }
  callback_url: string
}

export interface ChatCommandArguments {
  userId: string
  responseUrl: string
  [key: string]: string
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
  const validator = new Validator()
  if (!validator.validate(payload, BasecampCommandPayloadSchema)) {
    return
  }

  const command: string = payload.command
  const userId: string = payload.creator.attachable_sgid
  const responseUrl: string = payload.callback_url

  // Split on ALL whitespace
  const args: string[] = command.match(/\S+/g) || []
  ChatCommandParser.parse(args, { responseUrl, userId }, err => {
    if (err) {
      SendBasecampDefaultError(responseUrl, userId)
    }
  })
}
