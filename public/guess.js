var socket = io.connect();
var form = document.forms[0];
var tbody = document.getElementsByTagName('tbody')[0];
var results = document.getElementById('results');

socket.on('guesses', fillTable);
socket.on('results', fillResults);

form.onsubmit = function (evt) {
  evt.preventDefault();
  console.log(form.name.value, form.guess.value);
  socket.emit('guess', {
    name: form.name.value,
    guess: form.guess.value
  });
  form.name.value = '';
  form.guess.value = '';
};

function calculateResults (realCount) {
  socket.emit('calculate', realCount);
}

function fillTable (html) {
  tbody.innerHTML = html;
}

function fillResults (html) {
  results.innerHTML = html;
}