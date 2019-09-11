import { Chat, ChatStore, StorageEngine } from "@app/database"

jest.mock("@app/config", () => ({}))

class MockStorageEngine implements StorageEngine {
  public write: (chats: Chat[]) => void
  public read: () => Chat[]

  public constructor(chats?: Chat[]) {
    this.write = jest.fn()
    this.read = jest.fn().mockReturnValue(chats ? chats : [])
  }
}

describe("ChatStore", () => {
  describe("getRepositoriesByChat()", () => {
    it("return an empty list for no matches", () => {
      const store = new ChatStore(new MockStorageEngine())
      expect(store.getRepositoriesByChat("test-chat")).toEqual([])
    })

    it("should return the full list of repositories for the given chat", () => {
      const chat = "test-chat"
      const repos = ["A", "B", "C"]

      const db = [
        {
          chat_url: chat,
          repositories: repos,
        },
      ]

      const store = new ChatStore(new MockStorageEngine(db))
      expect(store.getRepositoriesByChat(chat)).toEqual(repos)
    })
  })

  describe("getChatsByRepository()", () => {
    it("should return an empty list for no matches", () => {
      const store = new ChatStore(new MockStorageEngine())
      expect(store.getChatsByRepository("test-repo")).toEqual([])
    })

    it("should return all chats that contain the repository", () => {
      const db = [
        { chat_url: "A", repositories: ["1", "2", "3"] },
        { chat_url: "B", repositories: ["1", "3"] },
        { chat_url: "C", repositories: ["2"] },
      ]

      const store = new ChatStore(new MockStorageEngine(db))
      expect(store.getChatsByRepository("2").sort()).toEqual(["A", "C"])
    })
  })

  describe("renameRepository()", () => {
    it("should rename all occurrences of the target", () => {
      const db = [
        { chat_url: "A", repositories: ["1", "2", "3"] },
        { chat_url: "B", repositories: ["1", "3"] },
        { chat_url: "C", repositories: ["2"] },
      ]

      const storageEngine = new MockStorageEngine(db)
      const store = new ChatStore(storageEngine)
      expect(store.getChatsByRepository("3").sort()).toEqual(["A", "B"])
      expect(store.getChatsByRepository("4")).toEqual([])

      store.renameRepository("3", "4")
      expect(storageEngine.write).toHaveBeenCalled()
      expect(store.getChatsByRepository("3")).toEqual([])
      expect(store.getChatsByRepository("4").sort()).toEqual(["A", "B"])
    })
  })

  describe("addRepositoryToChat()", () => {
    it("should create a new entry if it does not exist already", () => {
      const chat = "test-chat"
      const repo = "test-repo"

      const storageEngine = new MockStorageEngine()
      const store = new ChatStore(storageEngine)

      expect(store.getRepositoriesByChat(chat)).toHaveLength(0)
      store.addRepositoryToChat(repo, chat)
      expect(storageEngine.write).toHaveBeenCalled()

      let chatRepos = store.getRepositoriesByChat(chat)
      expect(chatRepos.length).toEqual(1)
      expect(chatRepos).toContain(repo)
    })

    it("should add to existing entries", () => {
      const chat = "test-chat"
      const repos = ["A", "B", "C"]

      const db = [
        {
          chat_url: chat,
          repositories: [repos[0], repos[1]],
        },
      ]
      const storageEngine = new MockStorageEngine(db)
      const store = new ChatStore(storageEngine)
      store.addRepositoryToChat(repos[2], chat)
      expect(storageEngine.write).toHaveBeenCalled()

      let chatRepos = store.getRepositoriesByChat(chat)
      expect(chatRepos.length).toEqual(3)
      expect(chatRepos).toEqual(repos)
    })
  })

  describe("removeRepositoriesFromChat()", () => {
    it("should do nothing if chat does not exist", () => {
      const store = new ChatStore(new MockStorageEngine())
      expect(() => store.removeRepositoryFromChat("repo", "chat")).not.toThrow()
    })

    it("should do nothing if chat isn't subscribed to repo", () => {
      const db = [
        {
          chat_url: "chat",
          repositories: ["A"],
        },
      ]
      const store = new ChatStore(new MockStorageEngine(db))

      store.removeRepositoryFromChat("B", "chat")
      expect(store.getRepositoriesByChat("chat")).toEqual(["A"])
    })

    it("should remove repository from subscribed chat", () => {
      const db = [
        {
          chat_url: "chat",
          repositories: ["A", "B", "C"],
        },
      ]
      const storageEngine = new MockStorageEngine(db)
      const store = new ChatStore(storageEngine)

      store.removeRepositoryFromChat("B", "chat")
      expect(storageEngine.write).toHaveBeenCalled()
      expect(store.getRepositoriesByChat("chat").sort()).toEqual(["A", "C"])
    })
  })

  describe("deleteRepository()", () => {
    it("should remove all occurrences of the repository", () => {
      const db = [
        { chat_url: "A", repositories: ["1", "2", "3"] },
        { chat_url: "B", repositories: ["1", "3"] },
        { chat_url: "C", repositories: ["2"] },
      ]
      const storageEngine = new MockStorageEngine(db)
      const store = new ChatStore(storageEngine)
      expect(store.getChatsByRepository("3").sort()).toEqual(["A", "B"])

      store.deleteRepository("3")
      expect(storageEngine.write).toHaveBeenCalled()
      expect(store.getChatsByRepository("3")).toEqual([])
    })
  })
})
