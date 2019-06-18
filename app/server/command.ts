import { NextFunction, Request, Response } from "express"

import { ParseBasecampPayload } from "@app/chat-command"
import config from "@app/config"

export function ChatCommand(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(204).send()

  // Don't handle requests where the access key doesn't match
  if (req.query.access_key !== config.basecamp_access_key) {
    throw Error(
      "Attempted access to /command with invalid access key: " +
        req.connection.remoteAddress
    )
  }

  if ("command" in req.body && "callback_url" in req.body) {
    ParseBasecampPayload(req.body)
  }

  next()
}
