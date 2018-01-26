# node-slack-introbot

A slackbot with features to help introduce slack users to each other. The focus is on breaking down barriers between users who might not normally interact with each other, particularly in larger organisations. It is also aimed to help new users find their feet and become comfortable sooner.

The bot is implemented in node.js.

## Development

The repo uses the awesome `ngrok` library to create a public endpoint and proxy it locally to your machine. To run the bot script:

- Register the bot as a local integration in your slack instance
- Copy `.env.example` to `.env` and populate the slack environment variables from your bot registration
- Run `npm run proxy` to launch `ngrok`
- Run `node index.js` to run the bot script
