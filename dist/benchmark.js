"use strict";

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