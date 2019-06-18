<p align="center">
  <img height="160" src="avatar.png" />
</p>

# Basecamp + GitHub Chatbot
[![Build Status](https://travis-ci.com/foundersclubsoftware/Basecamp-Github_Chatbot.svg?branch=master)](https://travis-ci.com/foundersclubsoftware/Basecamp-Github_Chatbot)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)][license]
[![Issues](https://img.shields.io/github/issues/foundersclubsoftware/Basecamp-Github_Chatbot.svg)][issues]

Your team uses Basecamp. And your team hosts code in a GitHub organization. Basecamp provides a basic chatbot for GitHub, but that requires manual setup for each repository, and only provides notifications for commits.

Basecamp + Github Chatbot provides teams with a simple solution for customizable notifications of all GitHub repository events!

* [Features](#Features)
* [Installation](#Installation)
    * [Configuration](#Configuration)
    * [Deployment](#Deployment)
    * [GitHub Setup](#GitHub%20Setup)
    * [Basecamp Setup](#Basecamp%20Setup)
* [Usage](#Usage)
* [Customizing Messages](#Customizing%20Messages)
* [Contributing](#Contributing)
* [Credits](#Credits)
* [License](#License)

## Features

### Interactive
The bot has simple commands for managing the repositories subscribed to by a given [Campfire](https://3.basecamp-help.com/article/40-campfire). Each Campfire can subscribe to as many repositories as necessary for the team or project. You can even [ping](https://3.basecamp-help.com/article/90-pings) the bot for private updates.
<p align="center">
  <img height="300" src="https://i.imgur.com/SCfOGzw.png" /><br>
  <span style="color:gray;font-size:10pt"><em>Example interaction</em></span>
</p>

### GitHub Organization-wide
The bot works at the [organization](https://help.github.com/en/articles/about-organizations) level of GitHub. This means that once you have your webhooks configured, no additional setup will be required to receive updates for new or deleted repositories.

### Customizable
Using [ejs](https://ejs.co/) templates, the repository notification messages can be customized to suit your needs. Any repository event from [this list](https://developer.github.com/v3/activity/events/types/) is supported.

## Installation
### Requirements
* A public-facing server with [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/install/), and [Node.js](https://nodejs.org/en/) installed to be able to build the Docker image. 
* Basecamp 3
* GitHub organization
* Admin rights on both Basecamp and Github (setup only)

### Server Setup
#### Configuration
Copy `.env.example` to `.env`. Set the following keys appropriately:

| Key | Value | Example |
| --- | --- | --- |
| `SERVER_PORT` | the port to run the server on | 3000 (default) |
| `BASECAMP_ACCESS_KEY` | an access key of your choice to prevent abuse | (see below) | 
| `BASECAMP_USER_AGENT` | user agent to use when making requests to the Basecamp API <sup>[[note]](https://github.com/basecamp/bc3-api#identifying-your-application)</sup> | Your-Org-Bot (your-email@example.org) |
| `GITHUB_HMAC_SECRET` | 20 character hex key also provided to GitHub | (see below) |
| `GITHUB_ORGANIZATION` | GitHub organization name | your-github-org-name |
| `DATA_DIRECTORY` | Where to store database and logs. Default `.`. | `data` |

Here are some good ways to generate your HMAC secret and access key: 
```
$ ruby -rsecurerandom -e 'puts SecureRandom.hex(20)'
477c9451ca82b8534e4f5efd0ab5d5ee9690318a

$ hexdump -n 20 -e '20/1 "%02x" 1 "\n"' /dev/urandom
7ff37aac0ef32709ed0341c61430fe6a3b71a03d
```

#### Deployment
You have 2 choices on how to run the application: Docker (recommended and tested), or Node.js.

##### Docker
If you would like to run your server in a Docker container, you only need `.env`, and optionally `docker-compose.yml`.

To simplify things, the default `docker-compose.yml` will run a single container, passing the environment variables in `.env`. By default the error log will be stored in the current local directory as `error.log`, and the database as `database.json`.

See the relevant comment in the `volumes` section of `docker-compose.yml` for help supplying your own message templates.

```
$ docker-compose -f docker-compose.yml up
# or
$ docker-compose -f docker-compose.yml up -d   # detached
```

To run without Docker Compose, use a command similar to the following:

```
$ docker run --env-file=.env -p 3000:3000 -v $(pwd)/error.log:/home/app/error.log -v $(pwd)/database.json:/home/app/database.json foundersclubsoftware/basecamp-github-chatbot:latest
```

##### Node.js
If you plan to run Node directly on your server and not use Docker, simply build and run on your server after setting your environment variables:

```
$ npm install 
$ npm run _build
$ npm run _production:run
```

Errors are logged to `error.log` when running in production, and the database is stored in `database.json`.

### GitHub Setup
In your GitHub organization, go to <kbd>Settings</kbd>&rarr;<kbd>Webhooks</kbd>&rarr;<kbd>Add webhook</kbd>.
<p align="center">
  <img height="300" src="https://i.imgur.com/5GKbuNA.png" /><br>
  <span style="color:gray;font-size:10pt"><em>Webhook setup</em></span>
</p>
Set the following values:

| Field | Value |
| --- | --- |
| Payload URL | `https://<your-server-host>/hook` |
| Content type | `application/json` |
| Secret | The value of `GITHUB_HMAC_SECRET` in your `.env` |

Select the events you would like to receive, then click <kbd>Add webhook</kbd>.

### Basecamp Setup
In any bucket in Basecamp, click the ellipsis in the upper right corner and select <kbd>Configure chatbots</kbd>&rarr;<kbd>Add new chatbot</kbd>.
<p align="center">
  <img height="300" src="https://i.imgur.com/x7wK8yJ.png" /><br>
  <span style="color:gray;font-size:10pt"><em>Webhook setup</em></span>
</p>
Set the following values:

| Field | Value |
| --- | --- |
| Avatar *(optional)* | [this project's icon](/avatar.png) |
| Name | `ghub` or however you wish to address your bot |
| Command URL | `https://<your-server-host>/command?access_key=<your-access-key>` |

Click <kbd>Add this chatbot</kbd> and you're ready to go!

## Usage
Interact with the bot by chatting `!<bot-name> <command>` in any campfire.  Available commands are:

| Command | Action |
| --- | --- |
| `help` | provides a brief summary of commands |
| `subscribe <repo>` | subscribes the current Campfire to notifications for `<repo>` |
| `unsubscribe <repo>` | unsubscribes the current Campfire to notifications for `<repo>` |
| `list` | list the repositories the current Campfire is subscribed to |

When subscribing or unsubscribing, omit the organization prefix (e.g. `repo` instead of `myorg/repo`).

## Customizing Messages

If you would like to add support for other events or change the message templates, edit the <kbd>notifications</kbd> key of `templates.json`. Place your modified `templates.json` in your data directory, alongside where the database is stored. Any events listed [here](https://developer.github.com/v3/activity/events/types/) are supported. If you limited your webhook on Github to certain events, you may need to update its scope.

Notification entries are of the form
```
"event_name": {
    "templates": {
        "hello": "<a href='hello'>hello</a>"
    }
    "actions": {
        "created": "<%- hello %> there",
        "default": "default message"
    }
}
```
where `event_name` is the GitHub webhook event name, and the keys of <kbd>actions</kbd> match the possible values of `action` in the webhook payload. The <kbd>default</kbd> value is used when a payload's action doesn't match any of the other keys. If the value of an action is an empty string, no message will be sent.

The <kbd>templates</kbd> key defines snippets that can be reused in the messages for each action of an event, as seen above. Both templates and actions use [ejs](https://ejs.co/) to render each message. The entire webhook payload object is available for use in your templates and messages. Examples of payload objects for each event type are available [here][webhook-events].

The entries in the <kbd>responses</kbd> key of `templates.json` can be edited to modify the responses of the bot to user commands.

## Contributing
[![Issues](https://img.shields.io/github/issues/foundersclubsoftware/Basecamp-Github_Chatbot.svg)][issues]
[![Pull Requests](https://img.shields.io/github/issues-pr/foundersclubsoftware/Basecamp-Github_Chatbot.svg)][prs]

You will need Docker and Node.js installed on your machine to develop for the bot.

You can use [ngrok](https://ngrok.com/) or a similar service to forward a server on your local machine to the public internet.

To run the application locally on your machine in development mode: 

```
$ npm run dev:build
$ npm run dev:run
```

If you find bugs or have a request, [create an issue][issues]. If you would like to contribute, feel free to [submit a pull request][prs]!

## Credits
* Levi Bostian [@levibostian](https://github.com/levibostian/)
* Oliver Emery [@thrymgjol](https://github.com/thrymgjol/)

## License
Basecamp + GitHub Chatbot is available under [version 2.0 of the Apache license][license].

> University of Iowa Founders Club &nbsp;&middot;&nbsp; [Website](https://www.iowajpec.org/foundersclub) &nbsp;&middot;&nbsp;
> GitHub [@foundersclubsoftware](https://github.com/foundersclubsoftware)

[issues]: https://github.com/foundersclubsoftware/Basecamp-Github_Chatbot/issues
[prs]: https://github.com/foundersclubsoftware/Basecamp-Github_Chatbot/pulls
[webhook-events]: https://developer.github.com/v3/activity/events/types/
[license]: https://opensource.org/licenses/Apache-2.0
[contributors]: http://github.com/rstacruz/nprogress/contributors
