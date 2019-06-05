import yargs from 'yargs'

import { chatError } from '@app/chat'

import commands from './modules'

export default async function parse(payload: any): Promise<void> {
    // Split on ALL whitespace
    const args: string[] = payload.command.match(/\S+/g) || []

    const parser = yargs
        .command(commands.fail)
        .command(commands.help)
        .command(commands.subscribe)
        .command(commands.unsubscribe)
        .command(commands.list)
        .fail((msg, err) => {
            chatError(payload.callback_url, payload.creator)
            throw err
        })
        .help(false)

    try {
        const argv = parser.parse(args, {
            creator: payload.creator,
            lines_url: payload.callback_url
        })
    } catch {
        // whoops
    }
}
