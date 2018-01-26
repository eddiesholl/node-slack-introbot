const { WebClient } = require('@slack/client');

class SlackChat {
  constructor() {
    this.web = new WebClient(process.env.SLACK_TOKEN);
  }

  post(channel, text, payload) {
    return this.web.chat.postMessage(channel, text, payload)
  }

  openMulti(...users) {
    return this.web.mpim.open(users.join(','))
  }
}

module.exports = SlackChat;
