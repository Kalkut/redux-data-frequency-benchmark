var WebSocket = require('ws');
var NanoTimer = require('nanotimer'); // We use nanotimer for better timeInverval accuracy

// https://github.com/Krb686/nanotimer#setintervaltask-args-interval-callback
var TIME_INTERVAL_BETWEEN_UPDATES = '250m';
var NB_USERS = 5;

var wss = new WebSocket.Server({ port: 4000 });

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function randomPosition(id) {
  // Most of the cubes will be in the default benchmark user field of view
  return JSON.stringify({
      id: id,
      x: random(-10, 10),
      y: 0.5,
      z: random(-2, -22),
    })
}

var benchmarkNo = 0;

wss.on('connection', function connection(ws) {
  ws.id = ++benchmarkNo;
  console.log(`Benchmark user n°${ws.id} connected`);
  console.log(`${NB_USERS} concurrent simulated users`);
  console.log(`Time interval per simulated user of ${TIME_INTERVAL_BETWEEN_UPDATES}`);

  function task() {
    for(var id = 0; id < NB_USERS; id++) {
      ws.send(randomPosition(id))
    }
  }

  var timer = new NanoTimer();
  timer.setInterval(task, '', TIME_INTERVAL_BETWEEN_UPDATES, function(err) {
    if(err) {
      //error
      console.log(err);
    }
  });

  ws.on('close', function close() {
    timer.clearInterval();
    console.log(`Test user n°${ws.id} disconnected`);
  });
});

console.log('Benchmark is waiting for a benchmark user...');
