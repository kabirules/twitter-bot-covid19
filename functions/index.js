const functions = require('firebase-functions');

var express = require('express');
var app = express();

var Twitter = require('twitter');
var twitter_config = require('./twitter-config.js');
var rapid_api_config = require('./rapid-api-config.js');
var https = require('https');
var T = new Twitter(twitter_config);
var countries_to_twit = ["Spain", "USA", "France", "Germany", "Italy", "UK", "China"];

// Set up your search parameters
var options = {
  hostname: 'covid-193.p.rapidapi.com',
  port: 443,
  path: '/statistics',
  method: 'GET',
  headers: {
    'x-rapidapi-host': rapid_api_config.xrapidapihost,
    'x-rapidapi-key': rapid_api_config.xrapidapikey
  }
};

app.get('/publish', function (req, res) {
  var twit = {status: 'No info today'};
  countries_to_twit.forEach(element => {
    options.path = '/statistics?country=' + element;
    //retrieve stats from RapidAPI
    https.request(options, function(res1) {
      res1.setEncoding('utf8');
      res1.on('data', function (chunk) {
        console.log(chunk);
        var jsonObject = JSON.parse(chunk);
        jsonObject.response.forEach(response => {
          var textToTwit = "COVID-19 " + response.country + " stats\n\n";
          textToTwit = textToTwit + "New cases: " + response.cases.new + "\n";
          textToTwit = textToTwit + "Total cases: " + response.cases.total + "\n";
          textToTwit = textToTwit + "New deaths: " + response.deaths.new + "\n";
          textToTwit = textToTwit + "Total deaths: " + response.deaths.total;
          console.log(textToTwit);
          twit = {"status": textToTwit};
          // Post a tweet
          T.post('statuses/update', twit,  function(error, tweet, response) {
            if (error) {
              res.send(error);
            } else {
              res.send('Done');
            }
          });
        });
      });
    }).end();
  });
});

app.get('/publishTest', function (req, res) {
  var str_response = '{"get":"statistics","parameters":[],"errors":[],"results":224,"response":[{"country":"China","cases":{"new":"+42","active":1116,"critical":144,"recovered":77455,"total":81907},"deaths":{"new":"+1","total":3336},"tests":{"total":null},"day":"2020-04-10","time":"2020-04-10T20:15:04+00:00"},{"country":"Italy","cases":{"new":"+3951","active":98273,"critical":3497,"recovered":30455,"total":147577},"deaths":{"new":"+570","total":18849},"tests":{"total":906864},"day":"2020-04-10","time":"2020-04-10T20:15:04+00:00"}]}';
  var jsonObject = JSON.parse(str_response);
  console.log(jsonObject);
  res.send('Done');
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

exports.app = functions.https.onRequest(app);
