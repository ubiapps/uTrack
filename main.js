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

app.get("/devices", function(req, res) {
  res.render("devices", { pageTitle: "devices", devices: cache.getDevices() });
});

app.get("/routes/:id", function(req, res) {
  var deviceId = req.param("id");
  var routes = geoRoutes.getRoutes(deviceId, routeThreshold);
  res.render("routes", { pageTitle: "routes", deviceId: deviceId, routes: routes });
});

app.get("/map", function(req, res) {
  var devices = cache.getDevices();
  res.render("mapLayout", { pageTitle: "map", devices: devices, deviceId: "", routes: {}, routeIndex: -1 });
});

app.get("/map/:id", function(req, res) {
  var devices = cache.getDevices();
  var deviceId = req.param("id");
  var routes = geoRoutes.getRoutes(deviceId, routeThreshold);
  res.render("mapLayout", { pageTitle: "map", devices: devices, deviceId: deviceId, routes: routes, routeIndex: -1 });
});

app.get("/map/:id/:routeIndex", function(req, res) {
  var devices = cache.getDevices();
  var deviceId = req.param("id");
  var routeIndex = req.param("routeIndex");
  var routes = geoRoutes.getRoutes(deviceId, routeThreshold);
  res.render("mapLayout", { pageTitle: "map", devices: devices, deviceId: deviceId, routes: routes, routeIndex: routeIndex });
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
