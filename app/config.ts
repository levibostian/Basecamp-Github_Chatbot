import configurationJSON from "@config/config.json"

const environment = process.env.NODE_ENV

if (!environment || !(environment in configurationJSON)) {
  console.log(
    `Fatal error: no configuration found for environement '${environment}'`
  )
  process.exit(1)
}

type Configuration = {
  basecamp_user_agent: string

  database: {
    file: string
    encoding: string
  }

  logging: {
    enabled: boolean
    file: string
    tags: {
      [key: string]: string
    }
  }

  messages: {
    help: string
    list_repos: string
    list_empty: string
    subscribe: string
    unrecognized: string
    unsubscribe: string
    unsubscribe_fail: string
  }

  hmac_secret: string
  access_key: string
}

const configuration: Configuration = (configurationJSON as any)[
  environment as string
]
export default configuration
