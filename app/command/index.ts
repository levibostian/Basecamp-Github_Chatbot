import yargs from 'yargs'

import commands from './modules'

export default async function parse(payload: any): Promise<void> {
    // Split on ALL whitespace
    const args: string[] = payload.command.match(/\S+/g) || []

    const parser = yargs
        .command(commands.fail)
        .command(commands.help)
        .command(commands.register)
        .command(commands.deregister)
        .command(commands.list)
        .fail((msg, err) => {
            commands.fail.send_error(payload.callback_url, payload.creator)
            throw err
        })
        .help(false)

    try {
        parser.parse(args, {
            creator: payload.creator,
            respond_url: payload.callback_url
        })
    } catch {
        // whoops
    }
}