import { NextFunction, Request, Response } from 'express'

import message from '@app/command/message' // terrible location but so tired will refactor asap
import db from '@app/database'
import translate from '@app/hook-translate'

export default function hook(req: Request, res: Response, next: NextFunction): void {
    res.status(204).send()

    const event = req.header('X-GitHub-Event')
    if(!event) {
        return next()
    }

    // TODO: hmac verification (https://developer.github.com/webhooks/securing/)

    const content = translate(event, req.body)
    
    // this should be separate `dispatch` function
    if(content) {
        db.getSubscribers(String(req.body.repository.id)).forEach(url => message(url, content))
    }

    next()
}