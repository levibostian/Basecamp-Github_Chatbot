import crypto from "crypto"
import { NextFunction, Request, Response } from "express"

import config from "@app/config"
import db from "@app/database"
import logger from "@app/logger"

import { SendBasecampChat } from "@app/basecamp-chat"
import { GithubPayload, TranslateGithubPayload } from "@app/github-webhook"

/* Add the hmac_verified property to Request objects */
declare global {
  namespace Express {
    export interface Request {
      hmac_verified: boolean
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

  if (!config.handled_events.includes(event)) {
    return
  }

  const message = TranslateGithubPayload(event, payload)
  db.getChatsByRepository(repo).forEach(chatUrl => {
    SendBasecampChat(chatUrl, message)
  })
}

export function VerifyGithubHMAC(
  req: Request,
  res: Response,
  buf: Buffer,
  encoding: string
): void {
  const senderSignature = req.header("X-Hub-Signature")
  if (!senderSignature) {
    req.hmac_verified = false
    return
  }

  const body = buf.toString(encoding)
  const hmac = crypto.createHmac("sha1", config.hmac_secret)
  const signature = "sha1=" + hmac.update(body).digest("hex")

  req.hmac_verified = signature === senderSignature
}

export function GithubWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(204).send()

  // Ensure the request came from Github
  if (!req.hmac_verified) {
    logger.log(
      config.logging.tags.security,
      "Attempted access to /hook with invalid signature: " +
        req.connection.remoteAddress
    )
    return next()
  }

  // Custom header set by GithHub to distinguish between events
  const event = req.header("X-GitHub-Event")
  if (!event) {
    logger.log(
      config.logging.tags.error,
      "Event header missing from request to /hook: " +
        req.connection.remoteAddress
    )
    return next()
  }

  dispatchMessages(event, req.body)
  next()
}
