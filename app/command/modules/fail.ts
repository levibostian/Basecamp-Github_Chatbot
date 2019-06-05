import { chatError } from '@app/chat'

const command = '*'
const describe = ''
const builder = {}

function handler(argv: any): void {
    chatError(argv.lines_url, argv.creator)
}

export default { command, describe, builder, handler }
