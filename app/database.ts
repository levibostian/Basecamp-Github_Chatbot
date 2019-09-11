import fs from "fs"
import path from "path"

import config from "@app/config"

export interface Chat {
  chat_url: string
  repositories: string[]
}

export interface StorageEngine {
  read: () => Chat[]
  write: (chats: Chat[]) => void
}

class AppStorageEngine implements StorageEngine {
  public constructor(private file: string) {}

  public read(): Chat[] {
    if (!fs.existsSync(this.file)) {
      return []
    } else {
      return JSON.parse(fs.readFileSync(this.file, "utf8"))
    }
  }

  public write(chats: Chat[]): void {
    try {
      fs.writeFileSync(this.file, JSON.stringify(chats), "utf8")
    } catch (err) {
      throw Error(
        `unable to save database, error writing to ${this.file}\n${err}\n${
          err.stack
        }`
      )
    }
  }
}

export class ChatStore {
  private chats: Chat[]

  public constructor(private storageEngine: StorageEngine) {
    this.chats = storageEngine.read()
  }

  private save(): void {
    this.storageEngine.write(this.chats)
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

    this.save()
  }

  /* Add a repo to a chat's subscriptions */
  public addRepositoryToChat(repo: string, chatUrl: string): void {
    const chat = this.getChat(chatUrl)

    if (chat && !chat.repositories.includes(repo)) {
      // Add repo to chat if chat already exists in db
      chat.repositories.push(repo)
    } else if (!chat) {
      // If the chat isn't in db, add chat with this repo
      this.chats.push({
        chat_url: chatUrl,
        repositories: [repo],
      })
    }

    this.save()
  }

  public removeRepositoryFromChat(repo: string, chatUrl: string): void {
    const chat = this.getChat(chatUrl)

    if (chat) {
      chat.repositories = chat.repositories.filter(r => r !== repo)
    }

    this.save()
  }

  public deleteRepository(repo: string) {
    this.chats.forEach(
      chat => (chat.repositories = chat.repositories.filter(r => r !== repo))
    )
    this.save()
  }
}

// Single instance
const STORE_FILE = path.join(config.data_directory, "database.json")
const database = new ChatStore(new AppStorageEngine(STORE_FILE))
export default database
