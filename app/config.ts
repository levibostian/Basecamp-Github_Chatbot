import dotenv from "dotenv"

dotenv.config()

const REQUIRED_VARIABLES = [
  "SERVER_PORT",
  "BASECAMP_ACCESS_KEY",
  "BASECAMP_USER_AGENT",
  "GITHUB_ORGANIZATION",
  "GITHUB_HMAC_SECRET",
]

let missingVariables: string[] = []
REQUIRED_VARIABLES.forEach(variable => {
  if (!(variable in process.env) || !process.env[variable]) {
    missingVariables.push(variable)
  }
})

if (missingVariables.length) {
  console.log("Missing the following required environment variables:")
  missingVariables.forEach(variable => console.log(`  - ${variable}`))
  process.exit(1)
}

export default {
  server_port: process.env.SERVER_PORT!,
  basecamp_access_key: process.env.BASECAMP_ACCESS_KEY!,
  basecamp_user_agent: process.env.BASECAMP_USER_AGENT!,
  github_organization: process.env.GITHUB_ORGANIZATION!,
  github_hmac_secret: process.env.GITHUB_HMAC_SECRET!,
  data_directory: process.env.DATA_DIRECTORY ? process.env.DATA_DIRECTORY : ".",
}
