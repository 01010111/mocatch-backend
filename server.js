var express = require("express");
var low = require("lowdb");
var FileSync = require("lowdb/adapters/FileSync");
var adapter = new FileSync(".data/db.json");
var db = low(adapter);
var app = express();
var bodyParser = require('body-parser')
var path = require('path')

var scores_to_add = [];

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

db.defaults({ scores: [
  {"id":1,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
  {"id":2,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
  {"id":3,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
  {"id":4,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
  {"id":5,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
  {"id":6,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
  {"id":7,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
  {"id":8,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
  {"id":9,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
  {"id":10, "name":"NO_ONE", "scores": [1234, 2345, 3456] },
]}).write();

app.use('/scores', (req, res) => {
  var dbscores=[];
  var scores = db.get('scores').value();
  scores.forEach((score) => {
    dbscores.push(score);
  });
  res.send(dbscores);
});

var blacklist = [
  
];

function verify(data) {
  if (!data.id || !data.name || !data.scores) {
    console.log(`Bad Data! data missing required element`);
    return false;
  }
  return true;
}

app.post('/post-score', (req, res) => {
  res.sendStatus(200);
  
  let body = JSON.parse(req.body.body);
  
  // verify data
  if (!verify(body)) {
    console.log('verification failed, trashing', body);
    return;
  }
  
  // check to see if id is present in db already and update it
  let current = db.get('scores').find({id:body.id}).value();
  if (current) {
    console.log('id present...updating data');
    console.log(db.get('scores').find({id:body.id}).assign({
      name:body.name,
      scores: body.scores,
	  date: body.date,
    }).value());
    return;
  }
  
  // otherwise add score to queue
  scores_to_add.push(body);
  return;
});

app.get('/reset', (req, res) => {
  db.get('scores')
    .remove()
    .write();
  console.log('Database cleared');
  
  var scores = [
	{"id":1,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
	{"id":2,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
	{"id":3,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
	{"id":4,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
	{"id":5,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
	{"id":6,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
	{"id":7,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
	{"id":8,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
	{"id":9,  "name":"NO_ONE", "scores": [1234, 2345, 3456] },
	{"id":10, "name":"NO_ONE", "scores": [1234, 2345, 3456] },
  ];
  scores.forEach((score) => {
    db.get('scores')
      .push({ "id":score.id,  "name":score.name, "scores":score.scores })
      .write();
  });
  console.log('default scores added');
  res.redirect('/');
});

var listener = app.listen(process.env.PORT, () => {
  console.log(`app listening on port ${listener.address().port}`);
});

function batch_push() {
  if (scores_to_add.length == 0) return;
  console.log(`Adding ${scores_to_add.length} scores...`);
  db.get('scores')
      .push(...scores_to_add)
      .write();
  scores_to_add = [];
}

setInterval(() => batch_push(), 1000);