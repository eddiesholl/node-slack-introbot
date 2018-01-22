const { WebClient } = require('@slack/client');

class SlackChat {
  constructor() {
    this.web = new WebClient(process.env.SLACK_TOKEN);
  }

  post(channel, text, payload) {
    return this.web.chat.postMessage(channel, text, payload)
  }
}

module.exports = SlackChat;
