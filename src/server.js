var express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
var server = require('http').createServer();

var createApplication = function () {
    var app = require('./app');
    server.on('request', app); // Attach the Express application.
};

// var startServer = function () {

//     var PORT = process.env.PORT || 1337;

//     server.listen(PORT, function () {
//         console.log('Server started on port', PORT);
//     });

// };

var app = express();

app.use('./', express.static(path.join(__dirname, 'src/assets/audio')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/src/assets/audio/:name', function (req, res, next){

  res.sendFile(path.join(__dirname, `src/assets/audio/${req.params.name}`));
})
app.get('/broken', function (req, res, next) {
  res.sendStatus(500);
})

app.get('/forbidden', function (req, res, next) {
  res.sendStatus(403);
})
