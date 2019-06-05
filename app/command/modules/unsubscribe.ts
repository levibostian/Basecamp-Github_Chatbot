import ejs from 'ejs'

import chat from '@app/chat'
import config from '@app/config'
import db from '@app/database'

const command = 'unsubscribe <repo>'
const describe = ''
const builder = {}

function deregister(lines_url: string, repo: string, creator: any): void {
    const repos = db.getRepositories(lines_url)

    if (repos.includes(repo)) {
        db.removeSubscriber(repo, lines_url)
        chat(lines_url, ejs.render(config.messages.unsubscribe, { repo }))
    } else {
        chat(
            lines_url,
            ejs.render(config.messages.unsubscribe_fail, { repo }),
            creator // this is an error, so @creator
        )
    }
}

function handler(argv: any): void {
    deregister(argv.lines_url, argv.repo, argv.creator)
}

export default { command, describe, builder, handler }
