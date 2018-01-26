const { createMessageAdapter } = require('@slack/interactive-messages');

class ActionResponder {
  constructor(verifyToken, slackChat) {
    this.slackChat = slackChat;
    this.messageAdapter = createMessageAdapter(verifyToken);
  }

  start(port) {
    this.messageAdapter.action('user_shown_possible_connections', (payload) => {
      try {
        console.log(`The user ${payload.user.name} in team ${payload.team.domain} pressed the welcome button`);

        const action = payload.actions[0];
        console.log(`The button had name ${action.name} and value ${action.value}`);

        // Prepare the response for return the client's chat
        // Note that the payload contains a copy of the original message (`payload.original_message`).
        // This is the place to choose what to replace in the user's message
        const replacement = payload.original_message;
        const attachmentIndex = replacement.attachments.findIndex(a => Array.isArray(a.actions) && a.actions[0].name === action.name);

        // Typically, you want to acknowledge the action and remove the interactive elements from the message
        if (action.value === 'no') {
          replacement.attachments[attachmentIndex].text +=` - OK, no problem`;
        }
        else {
          replacement.attachments[attachmentIndex].text +=` - Great, I'll set it up for you!`;

          this.slackChat.openMulti(payload.user.id, action.value)
            .then(response => {
              this.slackChat.post(response.group.id, 'Welcome to the group chat');
            });
        }
        delete replacement.attachments[attachmentIndex].actions;
        return replacement;
      }
      catch (e) {
        console.error('Failed to handle button click');
        console.error(e);
      }
    });

    return this.messageAdapter.start(port);
  }
}

module.exports = ActionResponder;
