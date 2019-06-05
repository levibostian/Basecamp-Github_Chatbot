import configurationJSON from '@config/config.json'

const environment = process.env.NODE_ENV

if (!environment || environment in configurationJSON === false) {
    console.log(`Fatal error: no configuration found for environement '${environment}'`)
    process.exit(1)
}

type Configuration = {
    basecamp: {
        user_agent: string       /* user-agent of messages sent to Basecamp */
    }

    database: {
        store_file: string       /* location of database file */
        encoding: string         /* encoding of database file */
    }

    logging: {
        enabled: boolean         /* whether or not to log */
        file: string             /* file to output logs to */
        tags: {                  /* logging tags */
            [key: string]: string
        }
    }     

    /* Chatbot interaction message templates */
    messages: {
        help: string             /* help message */
        list: string             /* list repos */
        list_empty: string       /* repo list empty */
        subscribe: string        /* repo subscribed */
        unrecognized: string     /* unrecognized command */
        unsubscribe: string      /* repo unsubscribed */
        unsubscribe_fail: string /* repo unsubscription failed */
    }

    hmac_secret: string
    access_key: string
}

const configuration: Configuration = (configurationJSON as any)[environment as string]
export default configuration
