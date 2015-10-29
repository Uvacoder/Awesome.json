'use strict';

var AwesomeWorker = require('../index');

var plugin = function(cb) {
  var get = require('simple-get');
  var AWESOME_URL = 'https://raw.githubusercontent.com/sindresorhus/awesome-nodejs/master/readme.md';
  var REGEX = /(\*|-) \[(.*?)\]\((.*?)\) - (.*?)\./g;

  get.concat(AWESOME_URL, (err, data, res) => {
    if (err && res.statusCode !== 200) {
      console.log(new Error('Unable to get the response.'));
    }

    let rawBody = data.toString().replace(/\n/g, '');
    let awesomeJson = {};

    let parseContent = (resolve, reject) => {
      let length = rawBody.split('###').length;
      let cnt = 0;
      rawBody.split('###').forEach((e) => {
        let category = e.split('- ')[0].trim();
        let match;
        if (!category.startsWith('#')) {
          awesomeJson[category] = [];
        }

        while ((match = REGEX.exec(e))) {
          if (!match[3].startsWith('#')) {
            awesomeJson[category].push({
              name: match[2],
              url:  match[3],
              description: match[4],
            });

          }
        }

        cnt++;
        if (cnt === length) {
          // Finish parsing
          resolve();
        }
      });
    };

    let p = new Promise(parseContent);

    p.then(() => {
      cb(awesomeJson);
    });
  });
};

var w = new AwesomeWorker('awesome-nodejs');
plugin((json) => {
  w.save(json);
});
