let nodeCache = require("node-cache");
let cache = null;

exports.start = function (done) {
  if (cache) return done();
  cache = new nodeCache();
};

exports.instance = function () {
  return cache;
};

exports.get = function (key) {
  return this.instance().get(key);
};


