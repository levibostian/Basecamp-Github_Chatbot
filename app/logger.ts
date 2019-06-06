import fs from "fs"

import config from "@app/config"

class Logger {
  private write(message: string): void {
    if (config.logging.enabled) {
      const line = new Date().toISOString() + "\t" + message + "\n"
      fs.appendFile(config.logging.file, line, err => {
        if (err) {
          console.log(`Error: unable to write logs to ${config.logging.file}`)
        }
      })
    }
  }

  public async log(tag: string, message: string): Promise<void> {
    this.write(`[${tag}] ${message}`)
  }
}

const logger = new Logger()
export default logger
