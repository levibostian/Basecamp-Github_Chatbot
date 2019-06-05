# Basecamp + Github Chatbot
A more advanced Basecamp chatbot to integrate GitHub and Basecamp

## Setup
1. Configure Github
    1. Generate a 20 character hex key and set `hmac_secret` in `config.json` to the value you generated.
    2. In your GitHub organization, go to <kbd>Settings</kbd>&rarr;<kbd>Webhooks</kbd>&rarr;<kbd>Add webhook</kbd>
    3. Set the following values:
        - Payload URL - `<your-server>/hook`
        - Content type - `application/json`
        - Secret - the value you generated
    4. Select the events you would like to receive, then click <kbd>Add webhook</kbd>

2. Configure Basecamp
    1. Generate a random access key and set `access_key` in `config.json` to the value you generated
    2. In any bucket in Basecamp, click the ellipsis in the upper right corner and select <kbd>Configure chatbots</kbd>&rarr;<kbd>Add new chatbot</kbd>
    3. Set the name field to whatever you wish to address the bot as
    4. Set the Command URL field to `<your-server>/command?access_key=<your-access-key>`
    5. Add the bot

1. Run `npm run build` then `npm run production` on a public-facing server.
