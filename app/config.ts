import dotenv from "dotenv"

dotenv.config()

const REQUIRED_VARIABLES = [
  "SERVER_PORT",
  "BASECAMP_ACCESS_KEY",
  "BASECAMP_USER_AGENT",
  "GITHUB_ORGANIZATION",
  "GITHUB_HMAC_SECRET",
]

const missingVariables: string[] = []
REQUIRED_VARIABLES.forEach((variable) => {
  if (!(variable in process.env) || !process.env[`${variable}`]) {
    missingVariables.push(variable)
  }
})

if (missingVariables.length) {
  console.log("Missing the following required environment variables:")
  missingVariables.forEach((variable) => console.log(`  - ${variable}`))
  process.exit(1)
}

export default {
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  server_port: process.env.SERVER_PORT!,
  basecamp_access_key: process.env.BASECAMP_ACCESS_KEY!,
  basecamp_user_agent: process.env.BASECAMP_USER_AGENT!,
  github_organization: process.env.GITHUB_ORGANIZATION!,
  github_hmac_secret: process.env.GITHUB_HMAC_SECRET!,
  database_file:
    "DATABASE_FILE" in process.env
      ? process.env.DATABASE_FILE!
      : "database.json",
  template_file:
    "TEMPLATE_FILE" in process.env
      ? process.env.TEMPLATE_FILE!
      : "templates.json",
  database_configmap: process.env.DATABASE_CONFIGMAP,
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
}
