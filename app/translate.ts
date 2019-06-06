import ejs from "ejs"

import config from "@app/config"
import logger from "@app/logger"
import translationData from "@config/translations.json"

let translations = translationData as {
  [key: string]: {
    templates: { [key: string]: string }
    actions: { [key: string]: string }
  }
}

export class PayloadTranslationError extends Error {}

export async function TranslateGithubPayload(
  event: string,
  payload: any
): Promise<string> {
  // Can't handle events with no translation
  if (!(event in translations)) {
    throw new PayloadTranslationError()
  }

  const translation = translations[event]
  // Inject templates
  Object.entries(translation.templates).forEach(v => {
    payload[v[0]] = ejs.render(v[1], payload)
  })

  let action: string = "default"
  if ("action" in payload && payload.action in translation.actions) {
    action = payload.action
  }

  const template: string = translation.actions[action]
  if (!template) {
    throw new PayloadTranslationError()
  }

  return ejs.render(template, payload, { async: true }).catch(err => {
    logger.log(
      config.logging.tags.error,
      "template rendering failed: " + err.message + "\n" + err.stack
    )
    throw new PayloadTranslationError()
  })
}
