import ejs from 'ejs'

import chat from '@app/chat'
import config from '@app/config'
import db from '@app/database'

const command = 'list'
const describe = ''
const builder = {}

function handler(argv: any): void {
    const subscriptions = db.getRepositories(argv.lines_url)
    if (subscriptions.length) {
        chat(argv.lines_url, ejs.render(config.messages.list, { subscriptions }))
    } else {
        chat(argv.lines_url, config.messages.list_empty)
    }
}

export default { command, describe, builder, handler }
