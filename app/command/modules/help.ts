import message from '../message'

const command = 'help'
const describe = 'get help'
const builder = {}

const help_message = '<strong>Available Commands</strong>'
    + '<ul><li>register &lt;owner&gt;/&lt;repo&gt;</li>'
    + '<li>deregister &lt;owner&gt;/&lt;repo&gt;</li>'
    + '<li>list</li></ul>'

function handler(argv: any): void {
    message(argv.respond_url, help_message)
}

export default { command, describe, builder, handler }