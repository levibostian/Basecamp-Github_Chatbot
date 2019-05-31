import ejs from 'ejs'

import message from '../message'

const command = '*'
const describe = 'default'
const builder = {}

const error_template = '<bc-attachment sgid="<%= attachable_sgid %>"></bc-attachment>, '
    + 'I didn\'t catch that. Try the <strong>help</strong> command to learn how to use me!'

function send_error(respond_url: string, creator: any) {
    message(respond_url, ejs.render(error_template, creator))
}

function handler(argv: any): void {
    send_error(argv.respond_url, argv.creator)
}

export default { command, describe, builder, handler, send_error }