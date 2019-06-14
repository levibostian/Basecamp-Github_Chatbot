import dotenv from "dotenv"

import server from "@app/server"

dotenv.config()

server.listen(process.env.SERVER_PORT, () => {
  console.log(`Server listening on :${process.env.SERVER_PORT}`)
})
