import configurationJSON from "@config/config.json"

const environment = process.env.NODE_ENV ? process.env.NODE_ENV : "default"
if (!(environment in configurationJSON)) {
  console.error(
    `Fatal error: no configuration found for environment '${environment}'`
  )
  process.exit(1)
}

type Configuration = {
  [key: string]: {
    basecamp_user_agent: string
    database_file: string

    handled_events: string[]

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
}

const configuration = configurationJSON as Configuration
export default configuration[environment]
