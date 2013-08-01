var express = require('express');
var concat = require('concat-stream');
var fs = require('fs');
var app = express();
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

app.post('/guess', function (req, res, next) {
  req.pipe(concat(function (body) {
    var guess = JSON.parse(body);
    console.log(guess);
    guesses.unshift(guess);
    res.send(generateTable());
    save.write(body + '\n');
  }));
});

app.get('/guesses', function (req, res, next) {
  res.send(generateTable());
});

app.post('/calculate', function (req, res, next) {
  req.pipe(concat(function (body) {
    var realCount = JSON.parse(body);
    res.send(calulateResults(realCount));
  }));
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
  return resultsTemplate
    .replace(/{{realCount}}/, realCount)
    .replace(/{{winnerName}}/, winner.name)
    .replace(/{{winnerGuess}}/, winner.guess)
    .replace(/{{mean}}/, mean)
    .replace(/{{mode}}/, mode)
    .replace(/{{median}}/, median);
}

function generateTable () {
  return guesses.map(function (guess) {
    return rowTemplate
      .replace(/{{name}}/, guess.name)
      .replace(/{{guess}}/, guess.guess);
  }).join('\n');
}

app.listen(3000);