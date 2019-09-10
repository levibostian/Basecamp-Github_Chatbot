import fs from "fs"
import path from "path"

import config from "@app/config"

interface Chat {
  chat_url: string
  repositories: string[]
}

export class ChatStore {
  private chats: Chat[]

  public constructor(private file: string) {
    this.chats = []
    this.reload()
  }

  private saveFile(): void {
    try {
      fs.writeFileSync(this.file, JSON.stringify(this.chats), "utf8")
    } catch (err) {
      throw Error(
        `unable to save database, error writing to ${this.file}\n${err}\n${
          err.stack
        }`
      )
    }
  }

  public reload(): void {
    // Empty/new database
    if (!fs.existsSync(this.file)) {
      this.chats = []
    } else {
      this.chats = JSON.parse(fs.readFileSync(this.file, "utf8"))
    }
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

  /* Return chat callback URLs for all chats subscribed to given repo */
  public getChatsByRepository(repo: string): string[] {
    return this.chats
      .filter(s => s.repositories.includes(repo))
      .map(s => s.chat_url)
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

  /* Add a repo to a chat's subscriptions */
  public addRepositoryToChat(repo: string, chatUrl: string): void {
    const chat = this.getChat(chatUrl)

    if (chat && !chat.repositories.includes(repo)) {
      chat.repositories.push(repo)
    } else {
      // TODO: Oh no! what if chat && chat.repos.includes()???
      this.chats.push({
        chat_url: chatUrl,
        repositories: [repo],
      })
    }

    this.saveFile()
  }

  public removeRepositoryFromChat(repo: string, chatUrl: string): void {
    const chat = this.getChat(chatUrl)

    if (chat) {
      chat.repositories = chat.repositories.filter(r => r !== repo)
    }

    this.saveFile()
  }

  public deleteRepository(repo: string) {
    this.chats.forEach(
      chat => (chat.repositories = chat.repositories.filter(r => r !== repo))
    )
    this.saveFile()
  }
}

// Single instance
const STORE_FILE = path.join(config.data_directory, "database.json")
const database = new ChatStore(STORE_FILE)
export default database
