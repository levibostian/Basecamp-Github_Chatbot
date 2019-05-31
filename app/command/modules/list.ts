import ejs from 'ejs'

import database from '@app/database'

import message from '../message'

const command = 'list'
const describe = 'list repos'
const builder = {}

const subscriptions_template = '<strong>Currently subscribed to</strong>'
    + '<ul><% subscriptions.forEach(s => { %><li><%= s %></li><% }); %></ul>'

function handler(argv: any): void {
    const subscriptions = database.getSubscriptions(argv.respond_url)
    if (subscriptions.length) {
        message(argv.respond_url, ejs.render(subscriptions_template, { subscriptions }))
    } else {
        message(argv.respond_url, 'This chat is not subscribed to any repositories.')
    }
}

export default { command, describe, builder, handler }