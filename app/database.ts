import fs from "fs"

import config from "@app/config"
import logger from "./logger"

type Subscription = {
  chat_url: string
  repositories: string[]
}

class SubscriptionStore {
  private subscriptions: Subscription[]

  public constructor() {
    this.subscriptions = this.readFile()
  }

  private saveFile(): void {
    fs.promises
      .writeFile(
        config.database.file,
        JSON.stringify(this.subscriptions),
        config.database.encoding
      )
      .catch(err => {
        if (err) {
          logger.log(
            config.logging.tags.error,
            `unable to save database, error writing to ${config.database.file}`
          )
        }
      })
  }

  private readFile(): Subscription[] {
    // Empty/new database
    if (!fs.existsSync(config.database.file)) {
      return []
    }

    return JSON.parse(
      fs.readFileSync(config.database.file, config.database.encoding)
    )
  }

  /* Get a subscription from a chat callback URL */
  private getSubscription(chatUrl: string): Subscription | undefined {
    return this.subscriptions.find(s => s.chat_url === chatUrl)
  }

  /* Get a list of repositories a chat is subscribed to */
  public getRepositories(lines_url: string): string[] {
    const subscription = this.getSubscription(lines_url)

    return subscription ? subscription.repositories : []
  }

  /* Change the name of a repository */
  public renameRepository(from: string, to: string): void {
    this.subscriptions.forEach(s => {
      const index = s.repositories.indexOf(from)
      if (index >= 0) {
        s.repositories[index] = to
      }
    })

    this.saveFile()
  }

  /* Return chat callback URLs for all chats subscribed to given repo */
  public getSubscribers(repo: string): string[] {
    return this.subscriptions
      .filter(s => s.repositories.includes(repo))
      .map(s => s.chat_url)
  }

  /* Add a repo to a chat's subscriptions */
  public addSubscription(repo: string, lines_url: string): void {
    const subscription = this.getSubscription(lines_url)

    if (subscription && !subscription.repositories.includes(repo)) {
      subscription.repositories.push(repo)
    } else {
      this.subscriptions.push({
        chat_url: lines_url,
        repositories: [repo],
      })
    }

    this.saveFile()
  }

  public removeSubscription(repo: string, lines_url: string): void {
    const subscription = this.getSubscription(lines_url)

    if (subscription) {
      subscription.repositories = subscription.repositories.filter(
        r => r !== repo
      )
    }

    this.saveFile()
  }
}

// Single instance
const database = new SubscriptionStore()
export default database
