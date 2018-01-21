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
      channel: 'D8W2MDBFC',
      text: 'yo',
      as_user: true
    }
    console.dir(chatPayload);
    return web.chat.postMessage(firstId, 'yo')
  })
  .catch(console.error)
