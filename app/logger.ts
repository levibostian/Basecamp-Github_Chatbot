import fs from 'fs'

import config from '@app/config'

class Logger {
    private write(message: string): void {
        if (config.logging.enabled) {
            const line = (new Date()).toISOString() + '\t' + message + '\n'

            try {
                fs.appendFileSync(config.logging.file, line)
            } catch {}
        }
    }

    public async log(tag: string, message: string): Promise<void> {
        this.write(`[${tag}] ${message}`)
    }
}

const logger = new Logger()
export default logger
