var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
io.set('log level', 0);
var fs = require('fs');
var guesses = [];
var rowTemplate = fs.readFileSync(__dirname + '/templates/row.tmpl').toString();
var resultsTemplate = fs.readFileSync(__dirname + '/templates/results.tmpl').toString();
fs.readFileSync(__dirname + '/save.json')
  .toString()
  .split('\n')
  .filter(function (r) { return r; })
  .forEach(function (row) {
    guesses.unshift(JSON.parse(row));
  });
var save = fs.createWriteStream(__dirname + '/save.json', { flags: 'a'});

app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', function (socket) {
  socket.emit('guesses', generateTable());
  socket.on('guess', function (guess) {
    guesses.unshift(guess);
    save.write(JSON.stringify(guess) + '\n');
    io.sockets.emit('guesses', generateTable());
  });
  socket.on('calculate', function (realCount) {
    io.sockets.emit('results', calulateResults(realCount));
  });
});

function calulateResults (realCount) {
  var winner = guesses.sort(function (a, b) {
    if (Math.abs(a.guess - realCount) > Math.abs(b.guess - realCount)) {
      return 1;
    } else {
      return -1;
    }
  })[0];
  var total = 0;
  var variance = 0;
  var numbers = guesses.map(function (guess) {
    return Number(guess.guess);
  });
  var guessCounts = {};
  numbers.forEach(function (number) {
    total += number;
    guessCounts[number] = guessCounts[number] != null ? ++guessCounts[number] : 1;
  });
  var mean = (total / guesses.length).toFixed(2);
  var mode = Object.keys(guessCounts).sort(function (a, b) {
    if (guessCounts[a] < guessCounts[b]) {
      return 1;
    } else {
      return -1;
    }
  })[0];
  var median = numbers.sort(function (a,b) {
    return a - b;
  })[~~(guesses.length / 2)];
  numbers.forEach(functino (number) {
    variance += Math.pow(number - realCount, 2);
  });
  var standardDeviation = Math.pow(variance / guesses.length, 0.5);
  return resultsTemplate
    .replace(/{{realCount}}/, realCount)
    .replace(/{{winnerName}}/, winner.name)
    .replace(/{{winnerGuess}}/, winner.guess)
    .replace(/{{mean}}/, mean)
    .replace(/{{mode}}/, mode)
    .replace(/{{median}}/, median)
    .replace(/{{standardDeviation}}/, standardDeviation);
}

function generateTable () {
  return guesses.map(function (guess) {
    return rowTemplate
      .replace(/{{name}}/, guess.name)
      .replace(/{{guess}}/, guess.guess);
  }).join('\n');
}

server.listen(3000);
