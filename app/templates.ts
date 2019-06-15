import ejs from "ejs"

import templateData from "../templates.json"

const templates = templateData as {
  notifications: {
    [key: string]: {
      templates: { [key: string]: string }
      actions: { [key: string]: string }
    }
  }
  responses: {
    help: string
    list_repos: string
    list_empty: string
    subscribe: string
    unrecognized: string
    unsubscribe: string
    unsubscribe_fail: string
  }
}

export const responses = templates.responses

export type GithubPayload = {
  [key: string]: any

  action: string
  repository: {
    name: string
  }
}

export function TranslateGithubPayload(
  event: string,
  payload: GithubPayload
): string {
  const translation = templates.notifications[event]

  if (!translation) {
    throw Error(
      `Could not find event "${event}" in your templates. If you wish to avoid this error, modify your organization webhook settings or add support in templates.json`
    )
  }

  let eventAction: string = "default"
  if ("action" in payload && payload.action in translation.actions) {
    eventAction = payload.action
  }

  if (!(eventAction in translation.actions)) {
    throw Error(
      `could not find template for action "${eventAction}" in event "${event}" in templates.json.`
    )
  }

  // Construct templates
  const eventTemplates: { [key: string]: string } = {}
  Object.entries(translation.templates).forEach(([key, value]) => {
    eventTemplates[key] = ejs.render(value, payload)
  })

  const targetTemplate: string = translation.actions[eventAction]
  return ejs.render(targetTemplate, { ...payload, ...eventTemplates })
}