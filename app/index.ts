import dotenv from "dotenv"

import server from "@app/server"

dotenv.config()

function checkEnvironment(): void {
  const env = process.env
  const REQUIRED_VARIABLES = [
    "SERVER_PORT",
    "BASECAMP_ACCESS_KEY",
    "BASECAMP_USER_AGENT",
    "GITHUB_ORGANIZATION",
    "GITHUB_HMAC_SECRET",
  ]

  let missingVariables: string[] = []
  REQUIRED_VARIABLES.forEach(variable => {
    if (!(variable in env)) {
      missingVariables.push(variable)
    }
  })

  if (missingVariables.length) {
    console.log("Missing the following required environment variables:")
    missingVariables.forEach(variable => console.log(`  - ${variable}`))
    process.exit(1)
  }
}

checkEnvironment()
server.listen(process.env.SERVER_PORT, () => {
  console.log(`Server listening on :${process.env.SERVER_PORT}`)
})
