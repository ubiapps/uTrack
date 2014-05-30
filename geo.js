(function() {
  var cache = require("./cache");

  var distance = function(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var a =
      0.5 - Math.cos((lat2 - lat1) * Math.PI / 180)/2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          (1 - Math.cos((lon2 - lon1) * Math.PI / 180))/2;

    return R * 2 * Math.asin(Math.sqrt(a));
  };

  var getRoutes = function(id, stationaryThreshold) {
    var routes = {};
    var mapData = cache.getData(id);
    var newRoute = function(startData) {
      return  { device: id, start: startData.location.timestamp, distance: 0, speed: 0, points: [] };
    };
    var addRoute = function(rt) {
      if (rt.points.length > 1) {
        var dateStart = new Date(rt.start).toDateString();
        if (!routes.hasOwnProperty(dateStart)) {
          routes[dateStart] = [];
        }
        rt.index = routes[dateStart].length;
        routes[dateStart].push(rt);
      } else {
        console.log("ignoring route with less than two way-points");
      }
    };

    // Need at least two way-points.
    if (mapData.length > 1) {
      var route = newRoute(mapData[0]);
      for (var i = 0, len = mapData.length; i < len-1; i++) {
        var p1 = mapData[i].location.coords;
        var p2 = mapData[i+1].location.coords;
        // Distance in metres.
        var dist = distance(p1.latitude, p1.longitude, p2.latitude, p2.longitude) * 1000;
        // Time in seconds.
        var time = (mapData[i+1].location.timestamp - mapData[i].location.timestamp) / 1000;
        // Speed in m/s.
        var speed = dist/time;
        // Accumulate totals.
        route.distance += dist;
        route.speed += speed;
        // Add point to route.
        route.points.push(mapData[i]);
        // Check for new route.
        if (time > stationaryThreshold) {
          addRoute(route);
          route = newRoute(mapData[i+1]);
        }
      }
      addRoute(route);
    }

    return routes;
  };

  module.exports = {
    getRoutes: getRoutes
  };
}());