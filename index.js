require('dotenv').config();
const SlackData = require('./src/slack-data');
const SlackChat = require('./src/slack-chat');
const ActionResponder = require('./src/action-responder');
const UserMatcher = require('./src/user-matcher');

const slackData = new SlackData();
const slackChat = new SlackChat();
const actionResponder = new ActionResponder(process.env.SLACK_VERIFICATION_TOKEN, slackChat);
const userMatcher = new UserMatcher(slackData, slackChat);

// Start the built-in HTTP server
const port = process.env.PORT || 3000;
actionResponder.start(port).then(() => {
  console.log(`server listening on port ${port}`);

  userMatcher.match();
});
