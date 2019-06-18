import { Monitor } from "forever-monitor"
import path from "path"

import config from "@app/config"

const child = new Monitor("dist/index.js", {
  max: 20,
  killTree: true,
  logFile: path.join(config.data_directory, "forever.log"),
  errFile: path.join(config.data_directory, "error.log"),
})
child.start()
