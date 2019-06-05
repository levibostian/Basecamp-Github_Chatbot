import crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'

import chat from '@app/chat'
import config from '@app/config'
import db from '@app/database'
import logger from '@app/logger'
import translate from '@app/translate'

/* Add the hmac_verified property to Request objects */
declare global {
    namespace Express {
        export interface Request {
            hmac_verified: boolean
        }
    }
}

/* Send appropriate message to all subscribed chats for the given payload */
function dispatch(event: string, payload: any): void {
    const repo = (payload.repository || {}).name
    if (!repo) {
        return
    }

    // Change repo name in database if renamed on Github
    if (event === 'repository' && payload.action === 'renamed') {
        db.renameRepository(payload.changes.repository.name.from, repo)
    }

    const content = translate(event, payload)
    if (content) {
        db.getSubscribers(repo)
            .forEach(lines_url => chat(lines_url, content))
    }
}

/* Verify HMAC signature of request */
export function verifyHmac(req: Request, res: Response, buf: Buffer, encoding: string): void {
    const senderSignature = req.header('X-Hub-Signature')
    if (!senderSignature) {
        req.hmac_verified = false
        return
    }

    const body = buf.toString(encoding)
    const hmac = crypto.createHmac('sha1', config.hmac_secret)
    const signature = 'sha1=' + hmac.update(body).digest('hex')

    console.log('sender_sig: ' + senderSignature)
    console.log('calculated: ' + signature)

    req.hmac_verified = (signature === senderSignature)
}

export default function hook(req: Request, res: Response, next: NextFunction): void {
    res.status(204).send()

    // Ensure the request came from Github
    if (!req.hmac_verified) {
        logger.log(
            config.logging.tags.security,
            'Attempted access to /hook with invalid signature: ' + req.connection.remoteAddress
        )
        return next()
    }

    // Custom header set by GithHub to distinguish between events
    const event = req.header('X-GitHub-Event')
    if (!event) {
        logger.log(
            config.logging.tags.error,
            'Event header missing from request to /hook'
        )
        return next()
    }

    dispatch(event, req.body)
    next()
}
