var express = require("express");
var jade = require("jade");
var bodyParser = require("body-parser");
var app = express();
var cache = require("./cache");
var geoRoutes = require("./geo");
var routeThreshold = 600;

app.set("views", __dirname + "/views");
app.set("view engine","jade");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.locals.pretty = true;

app.get("/view", function(req, res) {
  res.sendfile(_filePath);
});

app.get("/", function(req, res) {
  var devices = cache.getDevices();
  res.render("uTrack", { pageTitle: "map", devices: devices, deviceId: "", routes: {}, routeDate: "", routeIndex: -1 });
});

app.get("/:id", function(req, res) {
  var devices = cache.getDevices();
  var deviceId = req.param("id");
  var routes = geoRoutes.getRoutes(deviceId, routeThreshold);
  res.render("uTrack", { pageTitle: "map", devices: devices, deviceId: deviceId, routes: routes, routeDate: "", routeIndex: -1 });
});

app.get("/:id/:routeDate", function(req, res) {
  var devices = cache.getDevices();
  var deviceId = req.param("id");
  var routeDate = req.param("routeDate");
  var routes = geoRoutes.getRoutes(deviceId, routeThreshold);
  res.render("uTrack", { pageTitle: "map", devices: devices, deviceId: deviceId, routes: routes, routeDate: routeDate, routeIndex: -1 });
});

app.get("/:id/:routeDate/:routeIndex", function(req, res) {
  var devices = cache.getDevices();
  var deviceId = req.param("id");
  var routeDate = req.param("routeDate");
  var routeIndex = req.param("routeIndex");
  var routes = geoRoutes.getRoutes(deviceId, routeThreshold);
  res.render("uTrack", { pageTitle: "map", devices: devices, deviceId: deviceId, routes: routes, routeDate: routeDate, routeIndex: routeIndex });
});

app.get("/api/devices", function(req,res) {
  res.json(cache.getDevices());
});

app.get("/api/:id", function(req,res) {
  var devices = cache.getDevices();
  var deviceId = req.param("id");
  var routes = geoRoutes.getRoutes(deviceId, routeThreshold);
  res.json(Object.keys(routes));
});

app.post("/logStarted", function(req, res) {
  console.log("received logStarted");
  res.end("ok");
});

app.post("/logData", function(req, res) {
  console.log("received logData");
  try {
    var logId = req.body.id;
    var logData = req.body.logData;
    console.log(logData);
    try {
      var logParsed = JSON.parse(logData);
      cache.addData(logId, logParsed);
      res.write("ok");
    } catch (e) {
      res.write("error: failed to parse data");
    }
  } catch (e) {
    res.write("error: " + JSON.stringify(e));
  }
  res.end();
});

app.listen(3000);
