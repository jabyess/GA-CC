var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var http = require('http');
var path = require('path');
var qs = require('querystring');

// config object for all our environmental variables
var config = require('./config.js');
var API_KEY = config.API_KEY;

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/favorites', function(req, res) {
  var data = fs.readFileSync('./data.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
});

// add a search api route on the back end
app.post('/search', function(req, res) {
  // build params object
  var queryParams = {
    apikey: API_KEY,
    s: req.body.text,
    type: 'movie'
  };

  // stringify params to pass into request url
  var params = qs.stringify(queryParams);
  var url = 'http://www.omdbapi.com/?' + params;

  // perform the get request from node, with simple error handling
  http.get(url, function(response) {
    response.setEncoding('utf-8');

    // initialize variable to pass streaming data into
    var rawData = '';

    // stream data into rawData
    response.on('data', function(chunk) {
      rawData += chunk;
    });

    // when finished, return to the client.
    response.on('end', function() {
      res.send(rawData);
    });

    // if there's an error, log to the console and send back to client.
    response.on('error', function(err) {
      console.error('There was an error in the GET request', err);
      response.send('There was an error getting your data' + err.message);
    });
  });

});

app.post('/favorites', function(req, res) {
  if(!req.body.title || !req.body.imdbID) {
    res.send("Error");
    return;
  }
  
  var data = JSON.parse(fs.readFileSync('./data.json'));
  data.push(req.body);

  fs.writeFile('./data.json', JSON.stringify(data));
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
});

app.listen(app.get('port'), function() {
  console.log("Listening on port 3000");
});
