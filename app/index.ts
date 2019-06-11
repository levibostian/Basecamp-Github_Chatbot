import config from "@app/config"
import server from "@app/server"

const port = config.port ? config.port : 3000
server.listen(port, () => {
  console.log(`Server listening on :${port}`)
})
