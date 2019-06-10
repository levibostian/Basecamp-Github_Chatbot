# Basecamp + Github Chatbot
A more advanced Basecamp chatbot to integrate GitHub and Basecamp

## Setup
1. **Configure Github**
    1. Generate a 20 character hex key and set `hmac_secret` in `config.json` to the value you generated.
        * `ruby -rsecurerandom -e 'puts SecureRandom.hex(20)'` works well on MacOS
    2. In your GitHub organization, go to <kbd>Settings</kbd>&rarr;<kbd>Webhooks</kbd>&rarr;<kbd>Add webhook</kbd>
    3. Set the following values:
        - Payload URL - `<your-server>/hook`
        - Content type - `application/json`
        - Secret - the value you generated
    4. Select the events you would like to receive, then click <kbd>Add webhook</kbd>
![Github Setup](https://i.imgur.com/5GKbuNA.png)

2. **Configure Basecamp**
    1. Generate a random access key and set `access_key` in `config.json` to the value you generated
    2. In any bucket in Basecamp, click the ellipsis in the upper right corner and select <kbd>Configure chatbots</kbd>&rarr;<kbd>Add new chatbot</kbd>
    3. Set the name field to whatever you wish to address the bot as
    4. Set the Command URL field to `<your-server>/command?access_key=<your-access-key>`
    5. *(Optional)* Set the avatar to [the icon](/avatar.png) included in this repository
    6. Add the bot
![Basecamp Setup](https://i.imgur.com/x7wK8yJ.png)

3. Run `npm run build` then `npm run production` on a public-facing server.

## Interaction
![Interaction Example](https://i.imgur.com/SCfOGzw.png)

Interact with the bot by chatting `!<bot-name> <command>` in any campfire. When subscribing or unsubcribing, omit the organization prefix (e.g. `repo` instead of `myorg/repo`).

## Adding events

If you would like to add support for other events or change the message templates, edit `config/translations.json`. Any events listed [here](https://developer.github.com/v3/activity/events/types/) are supported. If you limited your webhook on Github to certain events, you may need to update its scope.

Translation entries are of the form
```
{
    "event_name": {
        "templates": {
            "hello": "<a href='hello'>hello</a>"
        }
        "actions": {
            "created": "<%- hello %> there",
            "default": "default message"
        }
    }
}
```
where `event_name` is the GitHub webhook event name, and the keys of `actions` match the possible values of `action` in the webhook payload. The `default` value is used when a payload's action doesn't match any of the other keys. If the value of an action is an empty string, no message will be sent.

The `templates` object defines snippets that can be reused in the messages for each action, as seen above. Both templates and actions use [ejs](https://ejs.co/) to render each message. The entire webhook payload object is available for use in your templates. Examples of payload objects for each event type are available [here](https://developer.github.com/v3/activity/events/types/).

## Development

To get started developing, follow the directions in the [Setup section](#Setup). In your `config.json` file, make sure you have an entry for the `development` environment. Run `npm run build` followed by `npm run local:run`, or `npm run docker:build` followed by `npm run docker:run` to run the server in development mode.

Errors are logged to `error.log` when running in production.
