import axios from 'axios'

import config from '@app/config'
import logger from '@app/logger'

type Creator = {
    attachable_sgid: string
}

/* Add a basecamp tag mentioning a user */
function mention(content: string, at: Creator): string {
    return `<bc-attachment sgid="${at.attachable_sgid}"></bc-attachment>, ${content}`
}

/* Send a message to a chat */
export default async function chat(lines_url: string, content: string, at?: Creator): Promise<void> {
    if (at) {
        content = mention(content, at)
    }

    try {
        await axios.post(
            lines_url,
            { content },
            { headers: { 'User-Agent': config.basecamp.user_agent } }
        )
    } catch (err) {
        logger.log(
            config.logging.tags.error,
            'Failed to POST ' + content + ' to ' + lines_url
        )
    }
}

export function chatError(lines_url: string, at?: Creator): void {
    chat(lines_url, config.messages.unrecognized, at)
}
