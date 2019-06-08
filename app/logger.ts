import fs from "fs"

import config from "@app/config"

async function log(tag: string, message: string): Promise<void> {
  if (config.logging.enabled) {
    const line = new Date().toISOString() + `\t[${tag}] ${message}\n`
    fs.appendFileSync(config.logging.file, line)
  }
}

export default { log }
