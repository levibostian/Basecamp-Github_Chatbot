import http from "http"
import { createTerminus, TerminusOptions } from "@godaddy/terminus"

import config from "@app/config"
import database from "@app/database"
import app from "@app/server"

function beforeShutdown(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 7000))
}

const terminusOptions: TerminusOptions = {
  healthChecks: {
    "/healthCheck": database.check.bind(database),
  },
  beforeShutdown,
  logger: console.log,
}

const server = http.createServer(app)
createTerminus(server, terminusOptions)

server.listen(config.server_port, () => {
  console.log(`Server listening on :${config.server_port}`)
})
