import dotenv from 'dotenv'
dotenv.config()

import github from '@app/github'
import server from '@app/server'

github.createHook()

server.listen(3000, () => {
    console.log('Server listenting on :3000')
})