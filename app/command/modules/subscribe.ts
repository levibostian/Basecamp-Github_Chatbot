import ejs from 'ejs'

import chat from '@app/chat'
import config from '@app/config'
import db from '@app/database'

const command = 'subscribe <repo>'
const describe = ''
const builder = {}

function handler(argv: any): void {
    db.addSubscriber(argv.repo, argv.lines_url)
    chat(argv.lines_url, ejs.render(
        config.messages.subscribe, { repo: argv.repo }
    ))
}

export default { command, describe, builder, handler }
