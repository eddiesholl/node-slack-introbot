const { IncomingWebhook, WebClient } = require('@slack/client');

const web = new WebClient(process.env.SLACK_TOKEN);
const timeNotification = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);
const currentTime = new Date().toTimeString();
// timeNotification.send(`The current time is ${currentTime}`, (error, resp) => {
//   if (error) {
//     return console.error(error);
//   }
//   console.log('Notification sent');
// });

web.users.list()
  .then(response => {
    // console.log('Users:')
    // console.log(JSON.stringify(response))
    return response.members.map(m => {
      return {
        id: m.id,
        name: m.name,
        tz_offset: m.tz_offset,
        updated: m.updated
      }
    })
  })
  .then(users => {
    console.log('Users:')
    console.log(JSON.stringify(users))

    return users
  })
  .then(users => {
    return web.im.list()
      .then(channels => {
        return {
          users,
          channels
        }
      })
    })
  .then(({ users, channels }) => {
    console.dir(channels)
    const firstId = users[0].id;
    chatPayload = {
      as_user: true,
      attachments: [
        {
          text: 'Attachment 1',
          "callback_id": "wopr_game",
          actions: [{
            "name": "game",
               "text": "Chess",
               "type": "button",
               "value": "chess"
          }]
        }
      ]
    }
    console.dir(chatPayload);
    return web.chat.postMessage('D8W2MDBFC', 'yo', chatPayload)
  })
  .catch(console.error)

  const { createMessageAdapter } = require('@slack/interactive-messages');

  // Initialize adapter using verification token from environment variables
  const slackMessages = createMessageAdapter(process.env.SLACK_VERIFICATION_TOKEN);

  // Attach action handlers by `callback_id`
  // (See: https://api.slack.com/docs/interactive-message-field-guide#attachment_fields)
  slackMessages.action('wopr_game', (payload) => {
    // `payload` is JSON that describes an interaction with a message.
    console.log(`The user ${payload.user.name} in team ${payload.team.domain} pressed the welcome button`);

    // The `actions` array contains details about the specific action (button press, menu selection, etc.)
    const action = payload.actions[0];
    console.log(`The button had name ${action.name} and value ${action.value}`);

    // You should return a JSON object which describes a message to replace the original.
    // Note that the payload contains a copy of the original message (`payload.original_message`).
    const replacement = payload.original_message;
    // Typically, you want to acknowledge the action and remove the interactive elements from the message
    replacement.text =`Welcome ${payload.user.name}`;
    delete replacement.attachments[0].actions;
    return replacement;
  });

  // Start the built-in HTTP server
  const port = process.env.PORT || 3000;
  slackMessages.start(port).then(() => {
    console.log(`server listening on port ${port}`);
  });
