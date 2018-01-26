require('dotenv').config();
const SlackData = require('./src/slack-data');
const SlackChat = require('./src/slack-chat');
const ActionResponder = require('./src/action-responder');

const slackData = new SlackData();
const slackChat = new SlackChat();
const actionResponder = new ActionResponder(process.env.SLACK_VERIFICATION_TOKEN, slackChat);

const renderJson = payload => {
  console.log(JSON.stringify(payload, 0, 4));
  return payload
}

slackData.users({ presence: true })
  .then(response => {
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
          team: { fields: [] }
        }
      })
      .catch(console.error)
    })
  .then(({ users, channels, team }) => {
    // Pick out custom fields
    const fieldId = team.fields.find(f => f.label === 'What I do')

    return users
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
        callback_id: 'user_shown_possible_connections',
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


  // Start the built-in HTTP server
  const port = process.env.PORT || 3000;
  actionResponder.start(port).then(() => {
    console.log(`server listening on port ${port}`);
  });
