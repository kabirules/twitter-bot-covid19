var express = require('express');
var app = express();

var Twitter = require('twitter');
var config = require('./config.js');
var http = require('http');
var T = new Twitter(config);

// Set up your search parameters
var options = {
  host: 'localhost',
  port: 3000,
  path: '/chistes?id=1',
  method: 'GET'
};

app.get('/publish', function (req, res) {
  var twit = {status: 'Hoy no toca chiste.'};
  http.request(options, function(res1) {
    //console.log('STATUS: ' + res.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(res.headers));
    res1.setEncoding('utf8');
    res1.on('data', function (chunk) {
      twit = {"status": chunk};
      console.log(twit);
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

app.listen(3001, function () {
    console.log('Example app listening on port 3000!');
});