<p align="center">
  <img height="160" src="avatar.png" />
</p>

# Basecamp + GitHub Chatbot
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
Clone this repository onto your server. In the `config` directory, copy `config.example.json` to `config.json`. Make sure you set the keys below appropriately.

| Key | Value | Example |
| --- | --- | --- |
| <kbd>port</kbd> | the port to run the server on | 3000 (default) |
| <kbd>basecamp_user_agent</kbd> | user agent to use when making requests to the Basecamp API <sup>[[note]](https://github.com/basecamp/bc3-api#identifying-your-application)</sup> | Your-Org-Bot (your-email@example.org) |
| <kbd>organization</kbd> | GitHub organization name | your-github-org-name | 
| <kbd>hmac_secret</kbd> | 20 character hex key also provided to GitHub | (see below) |
| <kbd>access_key</kbd> | an access key of your choice to prevent abuse | (see below) | 

Here are some good ways to generate your HMAC secret and access key: 
```
$ ruby -rsecurerandom -e 'puts SecureRandom.hex(20)'
477c9451ca82b8534e4f5efd0ab5d5ee9690318a

$ hexdump -n 20 -e '20/1 "%02x" 1 "\n"' /dev/urandom
7ff37aac0ef32709ed0341c61430fe6a3b71a03d
```

The configuration file allows you to define separate configurations for each possible value of `NODE_ENV`. If you are only looking to run this application in production, the "production" key already setup in `config.example.json` will do just fine. 

#### Deployment
You have 2 choices on how to run the application: Docker (recommended and tested), or Nodejs. The server runs on port 3000 by default, but you can modify the <kbd>port</kbd> setting in `config.json`.

##### Docker
If you would like to run your server in a Docker container, you only need to keep the `config` directory, and optionally `docker-compose.yml`. The command below will run the server, using the `config` directory in your current directory as well as storing the database file locally.

```
$ docker run -p 3000 -v $(pwd)/config/:/home/app/config/ -v $(pwd)/database.json:/home/app/database.json foundersclubsoftware/basecamp-github-chatbot:latest
```

To make things simple, `docker-compose.yml` in the root of this repository performs the same task. Modify the volumes to suit your needs, then run

```
$ docker-compose -f docker-compose.yml up
# or
$ docker-compose -f docker-compose.yml up -d   # detached
```

If you have changed the <kbd>port</kbd> setting from the default of 3000, you will have to modify the arguments to docker or your `docker-compose.yml`.

##### Node.js
If you plan to run Node directly on your server and not use Docker, simply build and run on your server: 
```
$ npm install 
$ npm run _build
$ npm run _production:run
```

Errors are logged to `error.log` when running in production. 

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
| Secret | The value of <kbd>hmac_secret</kbd> in your `config.json` |

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

If you would like to add support for other events or change the message templates, edit `config/translations.json`. Any events listed [here](https://developer.github.com/v3/activity/events/types/) are supported. If you limited your webhook on Github to certain events, you may need to update its scope.

Translation entries are of the form
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
where `event_name` is the GitHub webhook event name, and the keys of `actions` match the possible values of `action` in the webhook payload. The `default` value is used when a payload's action doesn't match any of the other keys. If the value of an action is an empty string, no message will be sent.

The `templates` object defines snippets that can be reused in the messages for each action of an event, as seen above. Both templates and actions use [ejs](https://ejs.co/) to render each message. The entire webhook payload object is available for use in your templates and messages. Examples of payload objects for each event type are available [here][webhook-events].

## Contributing
[![Issues](https://img.shields.io/github/issues/foundersclubsoftware/Basecamp-Github_Chatbot.svg)][issues]
[![Pull Requests](https://img.shields.io/github/issues-pr/foundersclubsoftware/Basecamp-Github_Chatbot.svg)][prs]

To get started developing, follow the directions in the [Configuration section](#Configuration). In your `config.json` file, make sure you have an entry for the `development` environment.

You can use [ngrok](https://ngrok.com/) or a similar service to forward a server on your local machine to the public internet.

You will need Docker and nodejs installed on your machine to develop for the bot. 

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
