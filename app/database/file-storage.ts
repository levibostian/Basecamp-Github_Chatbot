import { Chat, StorageEngine } from "@app/database"
import { constants as fsConstants, promises as fs } from "fs"

export class FileStorageEngine implements StorageEngine {
  public constructor(private file: string) {}

  public async check(): Promise<void> {
    try {
      await fs.access(this.file, fsConstants.R_OK | fsConstants.W_OK)
    } catch (err) {
      console.log(`Unable to access ${this.file} for read/write operations`)
      console.log(err)
      return Promise.reject()
    }
  }

  public async read(): Promise<Chat[]> {
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const data = await fs.readFile(this.file, "utf8")
      return JSON.parse(data)
    } catch (err) {
      return []
    }
  }

  public async write(chats: Chat[]): Promise<void> {
    try {
      const data = JSON.stringify(chats)
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(this.file, data, "utf8")
    } catch (err) {
      throw Error(
        `unable to save database, error writing to ${this.file}\n${err}\n${err.stack}`
      )
    }
  }
}
