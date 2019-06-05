import chat from '@app/chat'
import config from '@app/config'

const command = 'help'
const describe = ''
const builder = {}

function handler(argv: any): void {
    chat(argv.lines_url, config.messages.help)
}

export default { command, describe, builder, handler }
