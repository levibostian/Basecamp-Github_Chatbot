import ejs from "ejs"

import config from "@app/config"
import logger from "@app/logger"
import translationData from "@config/translations.json"

const translations = translationData as {
  [key: string]: {
    templates: { [key: string]: string }
    actions: { [key: string]: string }
  }
}

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
  const translation = translations[event]

  if (!(event in translations)) {
    logger.log(
      config.logging.tags.error,
      `could not find event "${event}" in translations.json`
    )
  }

  // Inject templates
  const templates: { [key: string]: string } = {}
  Object.entries(translation.templates).forEach(templateEntry => {
    templates[templateEntry[0]] = ejs.render(templateEntry[1], payload)
  })

  let eventAction: string = "default"
  if ("action" in payload && payload.action in translation.actions) {
    eventAction = payload.action
  }

  if (!(eventAction in translation.actions)) {
    logger.log(
      config.logging.tags.error,
      `could not find template for action "${eventAction}" in event "${event}" in translations.json`
    )
  }

  const template: string = translation.actions[eventAction]
  return ejs.render(template, { ...payload, ...templates })
}
