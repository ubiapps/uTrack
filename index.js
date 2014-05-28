var path = require("path");
var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.json());

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

app.get('/', function(req, res){
  res.send('hello');
});

app.post("/logStarted", function(req, res) {
  console.log("received logStarted");
  res.end("ok");
});

app.get("/view", function(req, res) {
  res.sendfile(_filePath);
});

app.post("/logData", function(req, res) {
  console.log("received logData");
  try {
    var logId = req.body.id;
    var logData = req.body.logData;
    console.log(logData);
    try {
      var logParsed = JSON.parse(logData);
      if (!_cache.hasOwnProperty(logId)) {
        _cache[logId] = [];
      }
      var timestamp = Date.now();
      var mapped = logParsed.map(function(el) {
        return { timestamp: timestamp, location: el };
      });
      _cache[logId] = _cache[logId].concat(mapped);
      saveCache();
      res.write("ok");
    } catch (e) {
      res.write("error: failed to parse data");
    }
  } catch (e) {
    res.write("error: " + JSON.stringify(e));
  }
  res.end();
});

loadCache();
app.listen(3000);
