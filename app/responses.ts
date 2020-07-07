import { Response } from "express"

interface ServerResponse {
  code: number
  message?: string
}

export const responses: {
  [key: string]: ServerResponse
} = {
  empty: { code: 204 },
  event_handled: {
    code: 200,
    message: "Event handled successfully.",
  },
  missing_event: {
    code: 422,
    message: "Missing X-GitHub-Event header.",
  },
  translation_error: {
    code: 404,
    message: "Template for event or action does not exist.",
  },
  basecamp_post_failed: {
    code: 500,
    message: "Failed to send Basecamp message. Check server log for details.",
  },
}

export function sendResponse(
  res: Response,
  serverResponse: ServerResponse
): void {
  res.status(serverResponse.code)
  if (serverResponse.message) {
    res.send({ message: serverResponse.message })
  } else {
    res.send()
  }
}
