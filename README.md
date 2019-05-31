# Basecamp-Github_Chatbot
A more advanced Basecamp chatbot to integrate GitHub and Basecamp

## Setup
1. Create personal GitHub access token [here](https://github.com/settings/tokens/new) with orginization hooks and repo permissions

2. Set environment variables in .env (based on .env.example) and deploy (currently using ngrok). Currently typescript is not compiling correctly but `npx nodemon` works fine.

3. Create Chatbot on Basecamp bucket
    - ... > Configure chatbots > Add a new chatbot
    - Command URL: \<server-url>/command

4. Run !\<bot-name> help in any chat to get started

## Note
This came together pretty fast but is still very rough and has many bugs. This is far from complete. A fully automated solution may involve a GitHub App along with a Basecamp integration.