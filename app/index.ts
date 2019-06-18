import config from "@app/config"
import server from "@app/server"

server.listen(config.server_port, () => {
  console.log(`Server listening on :${config.server_port}`)
})
