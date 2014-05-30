(function() {
  var path = require("path");
  var fs = require("fs");
  var _cache;
  var _filePath = path.join(__dirname,"logData.json");

  var loadCache = function() {
    if (fs.existsSync(_filePath)) {
      var logData = fs.readFileSync(_filePath);
      try {
        _cache = JSON.parse(logData);
      } catch (e) {
        console.log("failed to parse log data");
        _cache = {};
      }
    } else {
      _cache = {};
    }
  };

  var saveCache = function() {
    var logData = JSON.stringify(_cache,null,2);
    fs.writeFileSync(_filePath,logData);
  };

  var getDevices = function() {
    return Object.keys(_cache);
  };

  var addData = function(id, data) {
    var timestamp = Date.now();
    var mapped = data.map(function(el) {
      return { timestamp: timestamp, location: el };
    });
    if (!_cache.hasOwnProperty(id)) {
      _cache[id] = [];
    }
    _cache[id] = _cache[id].concat(mapped);
    saveCache();
  };

  var getData = function(id) {
    var d = {};
    if (_cache.hasOwnProperty(id)) {
      d = _cache[id];
    }
    return d;
  };

  loadCache();

  module.exports = {
    getCacheFilePath: function() { return _filePath },
    loadCache: loadCache,
    saveCache: saveCache,
    getDevices: getDevices,
    addData: addData,
    getData: getData
  };
}());

