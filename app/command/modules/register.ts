import ejs from 'ejs'

import db from '@app/database'
import github from '@app/github'
import message from '../message'

const command = 'register <repo>'
const describe = 'register repo'
const builder = {}

const registered_template = 'Successfully registered this chat for notifications on <a href="<%= html_url %>"><%= full_name %></a>'

async function handler(argv: any): Promise<void> {
    try {
        const repository = await github.getRepository(argv.repo)
        db.addSubscriber(String(repository.id), argv.respond_url)
        message(argv.respond_url, ejs.render(registered_template, repository))
    } catch {
        message(argv.respond_url, 'I was unable to access repository `' + argv.repo + '`')
    }
}

export default { command, describe, builder, handler }