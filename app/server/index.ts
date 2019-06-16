import express from "express"

import { ChatCommand } from "./command"
import { GithubWebhook, VerifyGithubHMAC } from "./hook"

const server = express()
server.disable("x-powered-by")

server.post(
  "/hook",
  express.json({
    verify: VerifyGithubHMAC,
  }),
  GithubWebhook
)

server.post("/command", express.json(), ChatCommand)

/* Send same response for all endpoints */
server.use((req, res, next) => {
  res.status(204).send()
  next()
})

export default server
