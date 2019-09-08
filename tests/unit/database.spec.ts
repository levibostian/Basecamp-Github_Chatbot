const fs = require("fs")

import { ChatStore } from "@app/database"

jest.mock("@app/config", () => ({
  data_directory: "tmp",
}))

jest.mock("fs", () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}))

const databaseFile = "test-database.json"

function prepareMockDatabaseFile(content?: string) {
  if (content) {
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(content)
  } else {
    fs.existsSync.mockReturnValue(false)
    fs.readFileSync.mockImplementation(() => {
      throw Error()
    })
  }
}

describe("ChatStore", () => {
  describe("getRepositoriesByChat()", () => {
    it("return an empty list for no matches", () => {
      prepareMockDatabaseFile()

      const store = new ChatStore(databaseFile)
      expect(store.getRepositoriesByChat("test-chat")).toEqual([])
    })

    it("should return the full list of repositories for the given chat", () => {
      const chat = "test-chat"
      const repos = ["A", "B", "C"]

      prepareMockDatabaseFile(
        JSON.stringify([
          {
            chat_url: chat,
            repositories: repos,
          },
        ])
      )

      const store = new ChatStore(databaseFile)
      expect(store.getRepositoriesByChat(chat)).toEqual(repos)
    })
  })

  describe("getChatsByRepository()", () => {
    it("should return an empty list for no matches", () => {
      prepareMockDatabaseFile()

      const store = new ChatStore(databaseFile)
      expect(store.getChatsByRepository("test-repo")).toEqual([])
    })

    it("should return all chats that contain the repository", () => {
      prepareMockDatabaseFile(
        JSON.stringify([
          { chat_url: "A", repositories: ["1", "2", "3"] },
          { chat_url: "B", repositories: ["1", "3"] },
          { chat_url: "C", repositories: ["2"] },
        ])
      )

      const store = new ChatStore(databaseFile)
      expect(store.getChatsByRepository("2").sort()).toEqual(["A", "C"])
    })
  })

  describe("renameRepository()", () => {
    it("should rename all occurrences of the target", () => {
      prepareMockDatabaseFile(
        JSON.stringify([
          { chat_url: "A", repositories: ["1", "2", "3"] },
          { chat_url: "B", repositories: ["1", "3"] },
          { chat_url: "C", repositories: ["2"] },
        ])
      )

      const store = new ChatStore(databaseFile)
      expect(store.getChatsByRepository("3").sort()).toEqual(["A", "B"])
      expect(store.getChatsByRepository("4")).toEqual([])

      store.renameRepository("3", "4")
      expect(fs.writeFileSync).toHaveBeenCalled()
      expect(store.getChatsByRepository("3")).toEqual([])
      expect(store.getChatsByRepository("4").sort()).toEqual(["A", "B"])
    })
  })

  describe("addRepositoryToChat()", () => {
    it("should create a new entry if it does not exist already", () => {
      prepareMockDatabaseFile()

      const chat = "test-chat"
      const repo = "test-repo"

      const store = new ChatStore(databaseFile)

      expect(store.getRepositoriesByChat(chat)).toHaveLength(0)
      store.addRepositoryToChat(repo, chat)
      expect(fs.writeFileSync).toHaveBeenCalled()

      let chatRepos = store.getRepositoriesByChat(chat)
      expect(chatRepos.length).toEqual(1)
      expect(chatRepos).toContain(repo)
    })

    it("should add to existing entries", () => {
      const chat = "test-chat"
      const repos = ["A", "B", "C"]

      prepareMockDatabaseFile(
        JSON.stringify([
          {
            chat_url: chat,
            repositories: [repos[0], repos[1]],
          },
        ])
      )
      const store = new ChatStore(databaseFile)
      store.addRepositoryToChat(repos[2], chat)
      expect(fs.writeFileSync).toHaveBeenCalled()

      let chatRepos = store.getRepositoriesByChat(chat)
      expect(chatRepos.length).toEqual(3)
      expect(chatRepos).toEqual(repos)
    })
  })

  describe("removeRepositoriesFromChat()", () => {
    it("should do nothing if chat does not exist", () => {
      prepareMockDatabaseFile()
      const store = new ChatStore(databaseFile)
      expect(() => store.removeRepositoryFromChat("repo", "chat")).not.toThrow()
    })

    it("should do nothing if chat isn't subscribed to repo", () => {
      prepareMockDatabaseFile(
        JSON.stringify([
          {
            chat_url: "chat",
            repositories: ["A"],
          },
        ])
      )
      const store = new ChatStore(databaseFile)

      store.removeRepositoryFromChat("B", "chat")
      expect(store.getRepositoriesByChat("chat")).toEqual(["A"])
    })

    it("should remove repository from subscribed chat", () => {
      prepareMockDatabaseFile(
        JSON.stringify([
          {
            chat_url: "chat",
            repositories: ["A", "B", "C"],
          },
        ])
      )
      const store = new ChatStore(databaseFile)

      store.removeRepositoryFromChat("B", "chat")
      expect(fs.writeFileSync).toHaveBeenCalled()
      expect(store.getRepositoriesByChat("chat").sort()).toEqual(["A", "C"])
    })
  })

  describe("deleteRepository()", () => {
    it("should remove all occurrences of the repository", () => {
      prepareMockDatabaseFile(
        JSON.stringify([
          { chat_url: "A", repositories: ["1", "2", "3"] },
          { chat_url: "B", repositories: ["1", "3"] },
          { chat_url: "C", repositories: ["2"] },
        ])
      )

      const store = new ChatStore(databaseFile)
      expect(store.getChatsByRepository("3").sort()).toEqual(["A", "B"])

      store.deleteRepository("3")
      expect(fs.writeFileSync).toHaveBeenCalled()
      expect(store.getChatsByRepository("3")).toEqual([])
    })
  })
})
