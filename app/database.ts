import fs from "fs"
import path from "path"

import config from "@app/config"

type Chat = {
  chat_url: string
  repositories: string[]
}

const ENCODING = "utf8"
const STORE_FILE = path.join(config.data_directory, "database.json")

class ChatStore {
  private chats: Chat[]

  public constructor() {
    this.chats = this.readFile()
  }

  private saveFile(): void {
    fs.promises
      .writeFile(STORE_FILE, JSON.stringify(this.chats), ENCODING)
      .catch(err => {
        throw Error(
          `unable to save database, error writing to ${STORE_FILE}\n${err}\n${
            err.stack
          }`
        )
      })
  }

  private readFile(): Chat[] {
    // Empty/new database
    if (!fs.existsSync(STORE_FILE)) {
      return []
    }

    return JSON.parse(fs.readFileSync(STORE_FILE, ENCODING))
  }

  /* Get a subscription from a chat callback URL */
  private getChat(chatUrl: string): Chat | undefined {
    return this.chats.find(s => s.chat_url === chatUrl)
  }

  /* Get a list of repositories a chat is subscribed to */
  public getRepositoriesByChat(chatUrl: string): string[] {
    const chat = this.getChat(chatUrl)
    return chat ? chat.repositories : []
  }

  /* Change the name of a repository */
  public renameRepository(oldName: string, newName: string): void {
    this.chats.forEach(chat => {
      const index = chat.repositories.indexOf(oldName)
      if (~index) {
        chat.repositories[index] = newName
      }
    })

    this.saveFile()
  }

  /* Return chat callback URLs for all chats subscribed to given repo */
  public getChatsByRepository(repo: string): string[] {
    return this.chats
      .filter(s => s.repositories.includes(repo))
      .map(s => s.chat_url)
  }

  /* Add a repo to a chat's subscriptions */
  public addRepositoryToChat(repo: string, chatUrl: string): void {
    const chat = this.getChat(chatUrl)

    if (chat && !chat.repositories.includes(repo)) {
      chat.repositories.push(repo)
    } else {
      this.chats.push({
        chat_url: chatUrl,
        repositories: [repo],
      })
    }

    this.saveFile()
  }

  public removeRepositoryFromChat(repo: string, charUrl: string): void {
    const chat = this.getChat(charUrl)

    if (chat) {
      chat.repositories = chat.repositories.filter(r => r !== repo)
    }

    this.saveFile()
  }

  public deleteRepository(repo: string) {
    this.chats.forEach(
      chat => (chat.repositories = chat.repositories.filter(r => r !== repo))
    )
  }
}

// Single instance
const database = new ChatStore()
export default database
