import responsesJSON from "@config/responses.json"

type Responses = {
  help: string
  list_repos: string
  list_empty: string
  subscribe: string
  unrecognized: string
  unsubscribe: string
  unsubscribe_fail: string
}

export default responsesJSON as Responses
