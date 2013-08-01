var express = require('express');
var app = express();
app.configure(function () {
  app.use('/libs', express.static('public/libs'));
  app.use('/presentations', express.static('public/presentations'));
});
app.listen(8888);

var http = require('http');
var server = http.createServer(app);
var socket = require('socket.io').listen(server);

var clients = [];
var state = 0;

// For each connection made add the client to the
// list of clients.
socket.on('connection', function(client) {
  clients.push(client);
  console.log("client added");

  client.on('disconnect', function() {
    clients.splice(clients.indexOf(client), 1);
  });
});

// This is a simple wrapper for sending a message
// to all the connected users and pruning out the
// disconnected ones.
function send(message) {
  // Iterate through all potential clients
  clients.forEach(function(client, index) {
    // User is still connected, send message
    // The User gets disconnected on the "disconnect" event!
    client.emit('message', message);
  });
}

app.get('/next', function(req, res) {
  state = 1;
  send({ state: state });
  res.send(state.toString());
});

app.get('/previous', function(req, res) {
  state = -1;
  send({ state: state });
  res.send(state.toString());
});

app.get('/', function(req, res) {
  res.redirect('presentations/index.html');
});
