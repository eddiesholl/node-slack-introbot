const { IncomingWebhook, WebClient } = require('@slack/client');
const NodeCache = require( "node-cache" );

class SlackData {
  constructor() {
    this.web = new WebClient(process.env.SLACK_TOKEN);
    this.cache = new NodeCache();
  }

  get(thunk, ttl, ...params) {
    const key = params.map(JSON.stringify).join('--')
    return new Promise((resolve, reject) => {
      this.cache.get(key, (err, value) => {
        if (err) {
          console.error(`Failed to cache get - ${key}`);
          reject(err)
        }
        else {
          if (value) {
            console.log('cache hit ' + key);
            resolve(value);
          }
          else {
            console.log('Running thunk - ' + key);
            const newValue = thunk().catch(e => {
              console.error('Failed to run thunk for key - ' + key);
              console.error(e);
              reject(e);
            })
            this.cache.set(key, newValue, ttl);

            resolve(newValue);
          }
        }
      })
    })
  }

  users(options) {
    return this.get(
      () => this.web.users.list(options),
      60,
      'users', options)
  }

  ims() {
    return this.get(
      () => this.web.im.list(),
      60,
      'ims'
    )
  }
}

module.exports = SlackData;
