import { NextFunction, Request, Response } from 'express'

import parse from '@app/command'

export default function command(req: Request, res: Response, next: NextFunction): void {
    // TODO: verify origin of request

    if ('command' in req.body && 'callback_url' in req.body) {
        parse(req.body)
    }

    res.status(204).send()
    next()
}