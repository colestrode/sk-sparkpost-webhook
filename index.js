'use strict';

let request = require('request');
let q = require('q');

module.exports = (controller) => {

  controller.hears('webhooks sample(s)?( events)?(:)?\\s*(.*)', 'direct_message,direct_mention', (bot, message) => {
    let promiseRequest = q.nfbind(request);
    let promiseUpload = q.nbind(bot.api.files.upload, bot.api.files);

    let requestConfig = {
      method: 'GET',
      uri: 'https://api.sparkpost.com/api/v1/webhooks/events/samples'
    };
    let events = message.match[4];

    if (events) {
      requestConfig.qs = {events: events.replace(/\s/g, '')};
    }

    return promiseRequest(requestConfig)
      .then((result) => {
        let response = result[0];
        return JSON.stringify(JSON.parse(response.body), null, 2);
      })
      .then((content) => {
        let title = 'Webhooks Sample Events';

        if (events) {
          title += ': ' + events;
        }

        return promiseUpload({
          filetype: 'javascript',
          filename: title,
          title: title,
          content: content,
          channels: message.channel
        });
      })
      .catch((err) => {
        controller.log(err);
        bot.reply(message, 'Oops! I couldn\'t fetch those events for you, try again in a minute.');
      });
  });
};

module.exports.help = {
  command: 'webhooks',
  text: (helpConfig) => {
    return 'Type `@' + helpConfig.botName + ' webhooks sample events` to get a list of all events. \n' +
      'You can include a comma delimited list of events to see just those events: ' +
      '`@' + helpConfig.botName + ' webhooks sample events: bounce,delivery`';
  }
};
