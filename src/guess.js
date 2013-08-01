var shoe = require('shoe');
var dnode = require('dnode');
var s = show('/dnode');
var d = dnode({
  fillTable: fillTable,
  fillResults: fillResults
});
var r;
d.on('remote', function (remote) {
  r = remote;
});
d.pipe(s).pipe(d);

var form = document.forms[0];
var tbody = document.getElementsByTagName('tbody')[0];
var results = document.getElementById('results');;

form.onsubmit = function (evt) {
  evt.preventDefault();
  console.log(form.name.value, form.guess.value);
  r.guess({
    name: form.name.value,
    guess: form.guess.value
  });
  form.name.value = '';
  form.guess.value = '';
};

function calculateResults (realCount) {
  r.calculateResults(realCount);
}

function fillTable (error, html) {
  if (error) {
    console.error(error);
    alert('eep, go grab Henry');
  } else {
    tbody.innerHTML = html;
  }
}

function fillResults (error, html) {
  if (error) {
    console.error(error);
    alert('eep, go grab Henry');
  } else {
    results.innerHTML = html;
    form.style.display = 'none';
  }
}
