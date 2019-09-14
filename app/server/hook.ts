import axios from "axios"
import crypto from "crypto"
import { NextFunction, Request, Response } from "express"

import config from "@app/config"
import db from "@app/database"
import { responses, sendResponse } from "@app/responses"
import {
  GithubPayload,
  TranslateGithubPayload,
  TranslationError,
} from "@app/templates"

/* Add the hmac_verified property to Request objects */
declare global {
  namespace Express {
    export interface Request {
      hmacVerified: boolean
    }
  }
}

function dispatchMessages(event: string, payload: GithubPayload): void {
  const repo = (payload.repository || {}).name
  if (!repo) {
    return
  }

  if (event === "repository") {
    switch (payload.action) {
      // Change repo name in database if renamed on Github
      case "renamed":
        db.renameRepository(payload.changes.repository.name.from, repo)
        break
      // Remove repo name from database if deleted on GitHub
      case "deleted":
        db.deleteRepository(repo)
        break
    }
  }

  const message = TranslateGithubPayload(event, payload)
  db.getChatsByRepository(repo).forEach(
    (chatUrl): void => {
      axios
        .post(
          chatUrl,
          { content: message },
          { headers: { "User-Agent": config.basecamp_user_agent } }
        )
        .catch(
          (err): void => {
            throw Error(
              `Failed to POST ${message} to ${chatUrl}\n${err}\n${err.stack}`
            )
          }
        )
    }
  )
}

export function VerifyGithubHMAC(
  req: Request,
  res: Response,
  buf: Buffer,
  encoding: string
): void {
  const senderSignature = req.header("X-Hub-Signature")
  if (!senderSignature) {
    req.hmacVerified = false
    return
  }

  const body = buf.toString(encoding)
  const hmac = crypto.createHmac("sha1", config.github_hmac_secret)
  const signature = "sha1=" + hmac.update(body).digest("hex")

  req.hmacVerified = signature === senderSignature
}

export function GithubWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Ensure the request came from Github
  if (!req.hmacVerified) {
    sendResponse(res, responses.empty)
    return next(
      Error(
        "Attempted access to /hook with invalid signature: " +
          req.connection.remoteAddress
      )
    )
  }

  // Custom header set by GithHub to distinguish between events
  const event = req.header("X-GitHub-Event")
  if (!event) {
    sendResponse(res, responses.missing_event)
    return next(
      Error(
        "Event header missing from request to /hook: " +
          req.connection.remoteAddress
      )
    )
  }

  try {
    dispatchMessages(event, req.body)
    sendResponse(res, responses.event_handled)
  } catch (err) {
    if (err instanceof TranslationError) {
      sendResponse(res, responses.translation_error)
    } else {
      sendResponse(res, responses.basecamp_post_failed)
    }
    return next(err)
  }

  next()
}
