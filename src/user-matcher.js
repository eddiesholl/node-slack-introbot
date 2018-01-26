class UserMatcher {
  constructor(slackData, slackChat) {
    this.slackData = slackData;
    this.slackChat = slackChat;
  }

  start() {
    this.slackData.users({ presence: true })
      .then(users => {
        const allOnline = users.filter(u => u.presence === 'active');

        if (allOnline.length < 2) {
          throw new Error('Not enough users online :(');
        }

        const firstOnline = allOnline[0];

        return this.match(firstOnline);
      });
  }

  match(targetUser) {
    return this.slackData.users({ presence: true })
      .then(allOnline => {
        const usersToChoose = allOnline.filter(u => u.id !== targetUser.id);

        if (usersToChoose.length < 1) {
          throw new Error('Not enough users online to connect to :(');
        }

        const candidates = usersToChoose.slice(0, 3);
        // console.dir(candidates)

        const chatPayload = {
          as_user: true,
          attachments: candidates.map(createUserAttachment)
        };

        return this.slackData.imForUser(targetUser.id)
          .then(dmChannel => {
            return this.slackChat.post(
              dmChannel.id,
              ":wave: Hey there! I'm here to help recent arrivals make connections with other users.\n\nI've randomly chosen a few users on slack to get things going.",
              chatPayload);
          })
          .catch(console.error);
        })
        .catch(console.error);
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
  };
};

module.exports = UserMatcher;
