import configurationJSON from "@config/config.json"

const environment = process.env.NODE_ENV ? process.env.NODE_ENV : "default"
if (!(environment in configurationJSON)) {
  throw Error(
    `Fatal error: no configuration found for environment '${environment}'`
  )
}

type Configuration = {
  [key: string]: {
    port: number
    basecamp_user_agent: string
    organization: string
    hmac_secret: string
    access_key: string
  }
}

const configuration = configurationJSON as Configuration
export default configuration[environment]
