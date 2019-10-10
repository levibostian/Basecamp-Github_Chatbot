import { Validator } from "jsonschema"
import yargs from "yargs"

import { CommandResponses } from "@app/templates"

import BasecampCommandPayloadSchema from "./basecamp-payload.schema.json"
import * as commands from "./modules"

interface BasecampCommandPayload {
  command: string
  creator: {
    attachable_sgid: string
  }
  callback_url: string
}

export interface ChatCommandContext {
  respond: (response: string, mention?: boolean) => void
  chatUrl: string
  repo: string
}

const ChatCommandParser = yargs
  .command(commands.fail)
  .command(commands.help)
  .command(commands.subscribe)
  .command(commands.unsubscribe)
  .command(commands.list)
  .help(false)

function mentionBasecampUser(message: string, userId: string): string {
  return `<bc-attachment sgid="${userId}"></bc-attachment>, ${message}`
}

export function ParseBasecampPayload(
  payload: BasecampCommandPayload
): Promise<string> {
  return new Promise(
    (resolve, reject): void => {
      const validator = new Validator()
      if (!validator.validate(payload, BasecampCommandPayloadSchema).valid) {
        reject(Error("invalid Basecamp payload schema"))
      }

      const userId = payload.creator.attachable_sgid
      const context = {
        chatUrl: payload.callback_url,
        respond: (response: string, mention?: boolean): void => {
          if (mention) {
            resolve(mentionBasecampUser(response, userId))
          } else {
            resolve(response)
          }
        },
      }

      // Split on ALL whitespace
      const args: string[] = payload.command.match(/\S+/g) || []
      ChatCommandParser.parse(
        args,
        context,
        (err): void => {
          if (err) {
            resolve(mentionBasecampUser(CommandResponses.unrecognized, userId))
          }
        }
      )
    }
  )
}
