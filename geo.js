(function() {
  var cache = require("./cache");

  var distance = function(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var a =
      0.5 - Math.cos((lat2 - lat1) * Math.PI / 180)/2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          (1 - Math.cos((lon2 - lon1) * Math.PI / 180))/2;

    return R * 2 * Math.asin(Math.sqrt(a));
  }

  var determineRoutes = function(id, stationaryThreshold) {
    var routes = [];
    var mapData = cache.getData(id);
    var newRoute = function() {
      var rt = { device: id, index: routes.length, distance: 0, speed: 0, points: [] };
      routes.push(rt);
      return rt;
    };

    // Need at least two way-points.
    if (mapData.length > 1) {
      var route = newRoute();
      route.start = mapData[0].location.timestamp;
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
          route = newRoute();
        }
      }
    }

    return routes;
  }

  module.exports = {
    getRoutes: determineRoutes
  };
}());