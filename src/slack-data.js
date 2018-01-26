const { WebClient } = require('@slack/client');
const NodeCache = require( "node-cache" );

class SlackData {
  constructor() {
    this.web = new WebClient(process.env.SLACK_TOKEN);
    this.cache = new NodeCache();
  }

  get(thunk, ttl, ...params) {
    const key = params.map(JSON.stringify).join('--');

    const lookupResult = this.cache.get(key);

    if (lookupResult == undefined) {
      const payload = thunk()
        .then(thunkResult => {
          this.cache.set(key, thunkResult, ttl);
          return thunkResult;
        })
        .catch(e => {
        console.error('Failed to run thunk for key - ' + key);
        console.error(e);
      });

      this.cache.set(key, payload, ttl);
      return payload;
    }
    else {
      return Promise.resolve(lookupResult);
    }
  }

  users(options) {
    return this.get(
      () => this.web.users.list(options)
        .then(response => {
          return response.members
            .filter(m => !m.is_bot && m.name !== 'slackbot');
            // .map(processMemberFields);
          }),
      60,
      'users', options
    );
  }

  ims() {
    return this.get(
      () => this.web.im.list().then(response => response.ims),
      60,
      'ims'
    );
  }

  imForUser(userId) {
    return this.get(
      () => this.ims().then(channels => channels.find(c => c.user === userId)),
      60,
      'imForUser',
      userId);
  }
}

module.exports = SlackData;
