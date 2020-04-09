var express = require('express');
var app = express();

var Twitter = require('twitter');
var config = require('./config.js');
var https = require('https');
var T = new Twitter(config);

// Set up your search parameters
var options = {
  hostname: 'covid-193.p.rapidapi.com',
  port: 443,
  path: '/statistics?country=Spain',
  method: 'GET',
  headers: {
    'x-rapidapi-host': config.xrapidapihost,
    'x-rapidapi-key': config.xrapidapikey
  }
};

app.get('/publish', function (req, res) {
  var twit = {status: 'No info today'};
  https.request(options, function(res1) {
    res1.setEncoding('utf8');
    res1.on('data', function (chunk) {
      var jsonObject = JSON.parse(chunk);
      var textToTwit = "COVID-19 " + jsonObject.response[0].country + " stats.\n";
      textToTwit = textToTwit + "New cases: " + jsonObject.response[0].cases.new + "\n";
      textToTwit = textToTwit + "Total cases: " + jsonObject.response[0].cases.total + "\n";
      textToTwit = textToTwit + "New deaths: " + jsonObject.response[0].deaths.new + "\n";
      textToTwit = textToTwit + "Total deaths: " + jsonObject.response[0].deaths.total;
      console.log(textToTwit);
      twit = {"status": textToTwit};
      T.post('statuses/update', twit,  function(error, tweet, response) {
        if (error) {
          res.send(error);
        } else {
          res.send('Done');
        }
      });
    });
  }).end();
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});