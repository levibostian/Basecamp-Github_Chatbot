import express from 'express'

import command from './command'
import hook from './hook'

const server = express()

server.use(express.json())
server.post('/hook', hook)
server.post('/command', command)

export default server