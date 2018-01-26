class UserMatcher {
  constructor(slackData, slackChat) {
    this.slackData = slackData;
    this.slackChat = slackChat;
  }

  match() {
    this.slackData.users({ presence: true })
      .then(response => {
        return response.members.map(processMemberFields)
      })
      .then(users => {
        return this.slackData.ims()
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

        const chatPayload = {
          as_user: true,
          attachments: usersToChoose.map(createUserAttachment)
        }

        return this.slackData.imForUser(firstOnline.id)
          .then(dmChannel => {
            return this.slackChat.post(
              dmChannel.id,
              ":wave: Hey there! I'm here to help recent arrivals make connections with other users.\n\nI've randomly chosen a few users on slack to get things going.",
              chatPayload)
          })
      })
      .catch(console.error)
  }
}

const processMemberFields = m => {
  return {
    id: m.id,
    name: m.name,
    tz_offset: m.tz_offset,
    updated: m.updated,
    presence: m.presence,
    image: m.profile.image_512
  }
}

const createUserAttachment = u => {
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
}

module.exports = UserMatcher
