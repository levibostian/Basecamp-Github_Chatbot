import ejs from "ejs"
import fs from "fs"

import config from "@app/config"

const templates: {
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
  // eslint-disable-next-line security/detect-non-literal-fs-filename
} = JSON.parse(fs.readFileSync(config.template_file).toString())

export const CommandResponses = templates.responses

export interface GithubPayload {
  [key: string]: unknown

  action: string
  repository: {
    name: string
  }
}

export class TranslationError extends Error {}

export function TranslateGithubPayload(
  event: string,
  payload: GithubPayload
): string {
  const translation = templates.notifications[`${event}`]

  if (!translation) {
    throw new TranslationError(
      `Could not find event "${event}" in your templates. If you wish to avoid this error, modify your organization webhook settings or add support in templates.json`
    )
  }

  let eventAction = "default"
  if ("action" in payload && payload.action in translation.actions) {
    eventAction = payload.action
  }

  if (!(eventAction in translation.actions)) {
    throw new TranslationError(
      `could not find template for action "${eventAction}" in event "${event}" in templates.json.`
    )
  }

  // Construct templates
  const eventTemplates: { [key: string]: string } = {}
  Object.entries(translation.templates).forEach(([key, value]) => {
    eventTemplates[`${key}`] = ejs.render(value, payload)
  })

  const targetTemplate: string = translation.actions[`${eventAction}`]
  return ejs.render(targetTemplate, { ...payload, ...eventTemplates })
}
