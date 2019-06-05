import express from 'express'

import command from './command'
import hook, { verifyHmac } from './hook'

const server = express()

server.post('/hook', express.json({
    verify: verifyHmac
}), hook)

server.post('/command', express.json(), command)

export default server
