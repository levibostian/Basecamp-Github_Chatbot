import fs from 'fs'

import config from '@app/config'

type Subscription = {
    lines_url: string
    repositories: string[]
}

class SubscriberStore {
    private subscribers: Subscription[]

    public constructor() {
        this.subscribers = this.read()
    }

    /* Write data to filesystem */
    private save(): void {
        try {
            let data = JSON.stringify(this.subscribers)
            fs.writeFileSync(config.database.store_file, data, config.database.encoding)
        } catch (err) {
            throw err
        }
    }

    /* Read data from filesystem */
    private read(): Subscription[]  {
        try {
            const data = fs.readFileSync(config.database.store_file, config.database.encoding)
            return JSON.parse(data) 
        } catch (err) {
            // File not found
            if (err.code === 'ENOENT') {
                return []
            }

            throw err
        }
    }

    /* Get a subscription from a chat callback URL */
    private getSubscription(lines_url: string): Subscription | undefined {
        return this.subscribers
            .find(s => s.lines_url === lines_url)
    }

    /* Get a list of repositories a chat is subscribed to */
    public getRepositories(lines_url: string): string[] {
        const subscription = this.getSubscription(lines_url)

        return subscription ? subscription.repositories : []
    }

    /* Change the name of a repository */
    public renameRepository(from: string, to: string): void {
        this.subscribers.forEach(s => {
            const index = s.repositories.indexOf(from)
            if (index >= 0) {
                s.repositories[index] = to
            }
        })

        this.save()
    }

    /* Return chat callback URLs for all chats subscribed to given repo */
    public getSubscribers(repo: string): string[] {
        return this.subscribers
            .filter(s => s.repositories.includes(repo))
            .map(s => s.lines_url)
    }

    /* Add a repo to a chat's subscriptions */
    public addSubscriber(repo: string, lines_url: string): void {
        const subscription = this.getSubscription(lines_url)

        if (subscription && !subscription.repositories.includes(repo)) {
            subscription.repositories.push(repo)
        } else {
            this.subscribers.push({
                lines_url,
                repositories: [ repo ]
            })
        }

        this.save()
    }

    /* Remove a repo from a chat's subscriptions */
    public removeSubscriber(repo: string, lines_url: string): void {
        const subscription = this.getSubscription(lines_url)

        if (subscription) {
            subscription.repositories = subscription.repositories
                .filter(r => r !== repo)
        }

        this.save()
    }
}

// Single instance
const database = new SubscriberStore()
export default database
