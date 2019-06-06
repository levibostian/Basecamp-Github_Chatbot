import express from "express"

import { ChatCommand } from "./command"
import { GithubWebhook, VerifyGithubHMAC } from "./hook"

const server = express()

server.post(
  "/hook",
  express.json({
    verify: VerifyGithubHMAC,
  }),
  GithubWebhook
)

server.post("/command", express.json(), ChatCommand)

export default server
