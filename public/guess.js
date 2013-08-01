var form = document.forms[0];
var tbody = document.getElementsByTagName('tbody')[0];
var results = document.getElementById('results');

get('/guesses', fillTable);

form.onsubmit = function (evt) {
  evt.preventDefault();
  console.log(form.name.value, form.guess.value);
  post('/guess', {
    name: form.name.value,
    guess: form.guess.value
  }, fillTable);
  form.name.value = '';
  form.guess.value = '';
};

function calculateResults (realCount) {
  post('/calculate', realCount, fillResults);
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

function post (url, data, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status !== 200) {
      cb(new Error('request error'));
    } else {
      cb(null, xhr.response);
    }
  };
  xhr.send(JSON.stringify(data));
}

function get (url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status !== 200) {
      cb(new Error('request error'));
    } else {
      cb(null, xhr.response);
    }
  };
  xhr.send();
}