import ejs from 'ejs'

import db from '@app/database'
import github from '@app/github'

import message from '../message'

const command = 'deregister <repo>'
const describe = 'deregister repo'
const builder = {}

const deregistered_template = 'Successfully unregistered this chat from notifications for <a href="<%= html_url %>"><%= full_name %></a>'

async function handler(argv: any): Promise<void> {
    try {
        const repository = await github.getRepository(argv.repo)
        db.removeSubscriber(String(repository.id), argv.respond_url)
        message(argv.respond_url, ejs.render(deregistered_template, repository))
    } catch {
        message(argv.respond_url, 'I was unable to access repository `' + argv.repo + '`')
    }
}

export default { command, describe, builder, handler }