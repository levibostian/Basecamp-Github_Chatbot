import config from "@app/config"
import { FileStorageEngine } from "./file-storage"
import { KubernetesStorageEngine } from "./k8s-storage"

export interface Chat {
  chat_url: string
  repositories: string[]
}

export interface StorageEngine {
  check: () => Promise<void>
  read: () => Promise<Chat[]>
  write: (chats: Chat[]) => Promise<void>
}

export class ChatStore {
  private chats!: Chat[]

  public constructor(private storageEngine: StorageEngine) {}

  public async load(): Promise<void> {
    this.chats = await this.storageEngine.read()
  }

  private async save(): Promise<void> {
    await this.storageEngine.write(this.chats)
  }

  public check(): Promise<void> {
    return this.storageEngine.check()
  }

  /* Get a subscription from a chat callback URL */
  private async getChat(chatUrl: string): Promise<Chat> {
    await this.load()
    const chat = this.chats.find((s) => s.chat_url === chatUrl)
    if (chat) return Promise.resolve(chat)

    return Promise.reject()
  }

  /* Get a list of repositories a chat is subscribed to */
  public async getRepositoriesByChat(chatUrl: string): Promise<string[]> {
    return this.getChat(chatUrl).then(
      (chat) => chat.repositories,
      () => []
    )
  }

  /* Return chat callback URLs for all chats subscribed to given repo */
  public async getChatsByRepository(repo: string): Promise<string[]> {
    await this.load()
    return this.chats
      .filter((s) => s.repositories.includes(repo))
      .map((s) => s.chat_url)
  }

  /* Change the name of a repository */
  public async renameRepository(
    oldName: string,
    newName: string
  ): Promise<void> {
    await this.load()
    this.chats.forEach((chat) => {
      const index = chat.repositories.indexOf(oldName)
      if (~index) {
        // eslint-disable-next-line security/detect-object-injection
        chat.repositories[index] = newName
      }
    })

    await this.save()
  }

  /* Add a repo to a chat's subscriptions */
  public async addRepositoryToChat(
    repo: string,
    chatUrl: string
  ): Promise<void> {
    await this.getChat(chatUrl)
      .then((chat) => {
        if (!chat.repositories.includes(repo)) {
          // Add repo to chat if chat already exists in db
          chat.repositories.push(repo)
        }
      })
      .catch(() => {
        this.chats.push({
          chat_url: chatUrl,
          repositories: [repo],
        })
      })
    await this.save()
  }

  public async removeRepositoryFromChat(
    repo: string,
    chatUrl: string
  ): Promise<void> {
    await this.getChat(chatUrl)
      .then(
        (chat) =>
          (chat.repositories = chat.repositories.filter((r) => r !== repo))
      )
      .catch(() => undefined)
    await this.save()
  }

  public async deleteRepository(repo: string): Promise<void> {
    await this.load()
    this.chats.forEach(
      (chat) =>
        (chat.repositories = chat.repositories.filter((r) => r !== repo))
    )
    await this.save()
  }
}

let database: ChatStore
if (config.database_configmap) {
  database = new ChatStore(
    new KubernetesStorageEngine(config.database_configmap)
  )
} else {
  database = new ChatStore(new FileStorageEngine(config.database_file))
}

export default database
