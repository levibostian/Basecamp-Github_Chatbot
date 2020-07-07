import { NextFunction, Request, Response } from "express"

import { ParseBasecampPayload } from "@app/chat-command"
import config from "@app/config"
import { responses, sendResponse } from "@app/responses"

export async function ChatCommand(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Don't handle requests where the access key doesn't match
  if (req.query.access_key !== config.basecamp_access_key) {
    sendResponse(res, responses.empty)
    return next(
      Error(
        "Attempted access to /command with invalid access key: " +
          req.connection.remoteAddress
      )
    )
  }

  try {
    if ("command" in req.body && "callback_url" in req.body) {
      const response = await ParseBasecampPayload(req.body)
      res
        .set("User-Agent", config.basecamp_user_agent)
        .contentType("text/html")
        .send(response)
    }
  } catch (err) {
    return next(err)
  }
}
