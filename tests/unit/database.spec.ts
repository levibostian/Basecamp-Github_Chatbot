import { Chat, ChatStore, StorageEngine } from "@app/database"

jest.mock("@app/config", () => ({
  data_directory: "mock",
}))

class MockStorageEngine implements StorageEngine {
  public check: () => Promise<void>
  public write: (chats: Chat[]) => Promise<void>
  public read: () => Promise<Chat[]>

  public constructor(chats?: Chat[]) {
    this.check = jest.fn()
    this.write = jest.fn()
    this.read = jest.fn().mockResolvedValue(chats ? chats : [])
  }
}

describe("ChatStore", () => {
  describe("getRepositoriesByChat()", () => {
    it("return an empty list for no matches", async () => {
      const store = new ChatStore(new MockStorageEngine())
      expect(await store.getRepositoriesByChat("test-chat")).toEqual([])
    })

    it("should return the full list of repositories for the given chat", async () => {
      const chat = "test-chat"
      const repos = ["A", "B", "C"]

      const db = [
        {
          chat_url: chat,
          repositories: repos,
        },
      ]

      const store = new ChatStore(new MockStorageEngine(db))
      expect(await store.getRepositoriesByChat(chat)).toEqual(repos)
    })
  })

  describe("getChatsByRepository()", () => {
    it("should return an empty list for no matches", async () => {
      const store = new ChatStore(new MockStorageEngine())
      expect(await store.getChatsByRepository("test-repo")).toEqual([])
    })

    it("should return all chats that contain the repository", async () => {
      const db = [
        { chat_url: "A", repositories: ["1", "2", "3"] },
        { chat_url: "B", repositories: ["1", "3"] },
        { chat_url: "C", repositories: ["2"] },
      ]

      const store = new ChatStore(new MockStorageEngine(db))
      expect((await store.getChatsByRepository("2")).sort()).toEqual(["A", "C"])
    })
  })

  describe("renameRepository()", () => {
    it("should rename all occurrences of the target", async () => {
      const db = [
        { chat_url: "A", repositories: ["1", "2", "3"] },
        { chat_url: "B", repositories: ["1", "3"] },
        { chat_url: "C", repositories: ["2"] },
      ]

      const storageEngine = new MockStorageEngine(db)
      const store = new ChatStore(storageEngine)
      expect((await store.getChatsByRepository("3")).sort()).toEqual(["A", "B"])
      expect(await store.getChatsByRepository("4")).toEqual([])

      await store.renameRepository("3", "4")
      expect(storageEngine.write).toHaveBeenCalled()
      expect(await store.getChatsByRepository("3")).toEqual([])
      expect((await store.getChatsByRepository("4")).sort()).toEqual(["A", "B"])
    })
  })

  describe("addRepositoryToChat()", () => {
    it("should create a new entry if it does not exist already", async () => {
      const chat = "test-chat"
      const repo = "test-repo"

      const storageEngine = new MockStorageEngine()
      const store = new ChatStore(storageEngine)

      expect(await store.getRepositoriesByChat(chat)).toHaveLength(0)
      await store.addRepositoryToChat(repo, chat)
      expect(storageEngine.write).toHaveBeenCalled()

      let chatRepos = await store.getRepositoriesByChat(chat)
      expect(chatRepos.length).toEqual(1)
      expect(chatRepos).toContain(repo)
    })

    it("should add to existing entries", async () => {
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
      await store.addRepositoryToChat(repos[2], chat)
      expect(storageEngine.write).toHaveBeenCalled()

      let chatRepos = await store.getRepositoriesByChat(chat)
      expect(chatRepos.length).toEqual(3)
      expect(chatRepos).toEqual(repos)
    })
  })

  describe("removeRepositoriesFromChat()", () => {
    it("should do nothing if chat does not exist", () => {
      const store = new ChatStore(new MockStorageEngine())
      return store.removeRepositoryFromChat("repo", "chat")
    })

    it("should do nothing if chat isn't subscribed to repo", async () => {
      const db = [
        {
          chat_url: "chat",
          repositories: ["A"],
        },
      ]
      const store = new ChatStore(new MockStorageEngine(db))

      await store.removeRepositoryFromChat("B", "chat")
      expect(await store.getRepositoriesByChat("chat")).toEqual(["A"])
    })

    it("should remove repository from subscribed chat", async () => {
      const db = [
        {
          chat_url: "chat",
          repositories: ["A", "B", "C"],
        },
      ]
      const storageEngine = new MockStorageEngine(db)
      const store = new ChatStore(storageEngine)

      await store.removeRepositoryFromChat("B", "chat")
      expect(storageEngine.write).toHaveBeenCalled()
      expect((await store.getRepositoriesByChat("chat")).sort()).toEqual([
        "A",
        "C",
      ])
    })
  })

  describe("deleteRepository()", () => {
    it("should remove all occurrences of the repository", async () => {
      const db = [
        { chat_url: "A", repositories: ["1", "2", "3"] },
        { chat_url: "B", repositories: ["1", "3"] },
        { chat_url: "C", repositories: ["2"] },
      ]
      const storageEngine = new MockStorageEngine(db)
      const store = new ChatStore(storageEngine)
      expect((await store.getChatsByRepository("3")).sort()).toEqual(["A", "B"])

      await store.deleteRepository("3")
      expect(storageEngine.write).toHaveBeenCalled()
      expect(await store.getChatsByRepository("3")).toEqual([])
    })
  })
})
