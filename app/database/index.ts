// TODO bad bad bad hack no good need real database

var hook_id: number = 0
var subscribers: {
    [key: string]: string[]
} = {}

function addSubscriber(repo: string, url: string): void {
    if(repo in subscribers) {
        subscribers[repo].push(url)
    } else {
        subscribers[repo] = [ url ]
    }
}

function removeSubscriber(repo: string, url: string): void {
    if(repo in subscribers) {
        subscribers[repo] = subscribers[repo].filter(u => u !== url)
    }
}

function getSubscriptions(url: string): string[] {
    return Object.entries(subscribers).filter(v => v[1].includes(url)).map(v => v[0])
}

function getSubscribers(repo: string): string[] {
    return subscribers[repo] || []
}

function getHookId(): number {
    return hook_id
}

function setHookId(id: number): void {
    hook_id = id
}

export default {
    addSubscriber,
    removeSubscriber,
    getSubscribers,
    getSubscriptions,
    getHookId,
    setHookId
}