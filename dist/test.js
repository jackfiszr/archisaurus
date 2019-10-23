"use strict";

var _database = require("./database");

var db = new _database.Database({
  users: [{
    name: 'index1',
    fields: ['username', 'password']
  }],
  accounts: ['_'],
  transactions: ['_', '_account']
}, "".concat(__dirname, "/../../@local/archivarius"));
var timers = {
  empty: 0,
  post: 0,
  put: 0
};

var act = function act(count, cb) {
  var from = Date.now();

  for (var i = 0; i < count; i++) {
    cb.call(null);
  }

  var to = Date.now();
  return to - from;
};

var count = 100; //const count = 2
//
//
// timers.post = act(count, () => {
// 	db.transactionsStart()
// 	const user = db.post('users', { username: 'ruslan', 'password': '131313' })
// 	db.transactionsCommit()
// })

console.table(timers);