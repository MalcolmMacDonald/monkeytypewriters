var config = require('./config');
var Twit = require('twit');
var T = new Twit(config);

exports.tweet = function (tweetString) {
    T.post('statuses/update', { status: tweetString }, function (err, data, response) {
        console.log(data);
    });
}