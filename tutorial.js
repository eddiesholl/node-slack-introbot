require('dotenv').config();
const SlackData = require('./src/slack-data');
const SlackChat = require('./src/slack-chat');

const slackData = new SlackData();
const slackChat = new SlackChat();


const renderJson = payload => {
  console.log(JSON.stringify(payload, 0, 4));
  return payload
}

slackData.users({ presence: true })
  .then(response => {
    // console.log('Users:')
    console.log(JSON.stringify(response, 0, 4))
    return response.members.map(m => {
      return {
        id: m.id,
        name: m.name,
        tz_offset: m.tz_offset,
        updated: m.updated,
        presence: m.presence,
        image: m.profile.image_512
      }
    })
  })
  .then(users => {
    return slackData.ims()
      .then(channels => {
        return {
          users,
          channels,
          // team: team.profile
          team: { fields: [] }
        }
      })
      .catch(console.error)
    })
  .then(({ users, channels, team }) => {
    const fieldId = team.fields.find(f => f.label === 'What I do')

    return users
    // return Promise.all(users.map(u => {
    //   return web.users.profile.get(true, u.id)
    //     .then(renderJson)
    //   }))
  })
  .then(users => {

    const allOnline = users.filter(u => u.presence === 'active')

    if (allOnline.length < 2) {
      throw new Error('Not enough users online :(')
    }

    const firstOnline = allOnline[0];
    const usersToChoose = allOnline.slice(1, 3);

    const chooseActions = usersToChoose.map(u => {
      return {
        name: u.id,
        text: u.name,
        type: 'button',
        value: u.id
      }
    })

    const avatars = usersToChoose.map(u => {
      return {
        text: `<@${u.id}>`,
        callback_id: 'wopr_game',
        author_name: u.name,
        author_icon: u.image,
        actions: [{
          name: u.id,
          text: "Let's go",
          type: 'button',
          value: u.id
        }, {
          name: u.id,
          text: 'No thanks',
          type: 'button',
          value: 'no'
        }]
      }
    })

    chatPayload = {
      as_user: true,
      attachments: avatars
      // attachments: [
      //   {
      //     text: ':wave: Hey there! Would you like an introduction to someone else on slack?',
      //     "callback_id": "wopr_game",
      //     actions: chooseActions
      //   }
      // ]
    }

    return slackData.imForUser(firstOnline.id)
      .then(dmChannel => {
        return slackChat.post(
          dmChannel.id,
          ":wave: Hey there! I'm here to help recent arrivals make connections with other users.\n\nI've randomly chosen a few users on slack to get things going.",
          chatPayload)
      })
  })
  .catch(console.error)

  const { createMessageAdapter } = require('@slack/interactive-messages');

  // Initialize adapter using verification token from environment variables
  const slackMessages = createMessageAdapter(process.env.SLACK_VERIFICATION_TOKEN);

  // Attach action handlers by `callback_id`
  // (See: https://api.slack.com/docs/interactive-message-field-guide#attachment_fields)
  slackMessages.action('wopr_game', (payload) => {
    try {
      console.log('getting ims')
      slackData.ims().then(() => console.log('got ims!!!'))
      // `payload` is JSON that describes an interaction with a message.
      console.log(`The user ${payload.user.name} in team ${payload.team.domain} pressed the welcome button`);

      // The `actions` array contains details about the specific action (button press, menu selection, etc.)
      const action = payload.actions[0];
      console.log(`The button had name ${action.name} and value ${action.value}`);

      // You should return a JSON object which describes a message to replace the original.
      // Note that the payload contains a copy of the original message (`payload.original_message`).
      const replacement = payload.original_message;
      console.log(JSON.stringify(payload.original_message, 0, 4))
      const attachmentIndex = replacement.attachments.findIndex(a => Array.isArray(a.actions) && a.actions[0].name === action.name)
      // replacement.attachments[attachmentIndex] = { text: 'Thanks!' }
      // Typically, you want to acknowledge the action and remove the interactive elements from the message
      console.log(attachmentIndex)
      if (action.value === 'no') {
        replacement.attachments[attachmentIndex].text +=` - OK, no problem`;
      }
      else {
        replacement.attachments[attachmentIndex].text +=` - Great, I'll set it up for you!`;
      }
      delete replacement.attachments[attachmentIndex].actions;
      return replacement;
    }
    catch (e) {
      console.error('Failed to handle button click');
      console.error(e);
    }
  });

  // Start the built-in HTTP server
  const port = process.env.PORT || 3000;
  slackMessages.start(port).then(() => {
    console.log(`server listening on port ${port}`);
  });
