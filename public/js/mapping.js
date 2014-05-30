function distance(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var a =
    0.5 - Math.cos((lat2 - lat1) * Math.PI / 180)/2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        (1 - Math.cos((lon2 - lon1) * Math.PI / 180))/2;

  return R * 2 * Math.asin(Math.sqrt(a));
}

function determineRoutes() {
  var routes = [];
  var routeIdx = 0;
  routes.push([]);
  for (var i = 0, len = mapData.length; i < len-1; i++) {
    var dist = distance(mapData[i].location.coords.latitude, mapData[i].location.coords.longitude, mapData[i+1].location.coords.latitude, mapData[i+1].location.coords.longitude) * 1000;
    var time = (mapData[i+1].location.timestamp - mapData[i].location.timestamp) / 1000;
    var speed = dist/time;
    routes[routeIdx].push(mapData[i]);
    console.log("distance: " + dist + ", time: " + time + ", speed: " + speed);
    // Stationary for 10 mins?
    if (time > 600) {
      routeIdx++;
      routes.push([]);
    }
  }
  return routes;
}

var smoothRoute = function(route) {
  var routePoints = route.points;
  var i, t, ax, ay, bx, by, cx, cy, dx, dy, lat, lon, points;
  points = [];
  for (i = 2; i < routePoints.length - 2; i++) {
    for (t = 0; t < 1; t += 0.2) {
      ax = (-routePoints[i - 2].location.coords.latitude + 3 * routePoints[i - 1].location.coords.latitude - 3 * routePoints[i].location.coords.latitude + routePoints[i + 1].location.coords.latitude) / 6;
      ay = (-routePoints[i - 2].location.coords.longitude + 3 * routePoints[i - 1].location.coords.longitude - 3 * routePoints[i].location.coords.longitude + routePoints[i + 1].location.coords.longitude) / 6;
      bx = (routePoints[i - 2].location.coords.latitude - 2 * routePoints[i - 1].location.coords.latitude + routePoints[i].location.coords.latitude) / 2;
      by = (routePoints[i - 2].location.coords.longitude - 2 * routePoints[i - 1].location.coords.longitude + routePoints[i].location.coords.longitude) / 2;
      cx = (-routePoints[i - 2].location.coords.latitude + routePoints[i].location.coords.latitude) / 2;
      cy = (-routePoints[i - 2].location.coords.longitude + routePoints[i].location.coords.longitude) / 2;
      dx = (routePoints[i - 2].location.coords.latitude + 4 * routePoints[i - 1].location.coords.latitude + routePoints[i].location.coords.latitude) / 6;
      dy = (routePoints[i - 2].location.coords.longitude + 4 * routePoints[i - 1].location.coords.longitude + routePoints[i].location.coords.longitude) / 6;
      lat = ax * Math.pow(t + 0.1, 3) + bx * Math.pow(t + 0.1, 2) + cx * (t + 0.1) + dx;
      lon = ay * Math.pow(t + 0.1, 3) + by * Math.pow(t + 0.1, 2) + cy * (t + 0.1) + dy;
      points.push(new google.maps.LatLng(lat, lon));
    }
  }

  return points;
};

$(function() {
  $("#deviceSelect").on("change.fs", function() {
    $(".loading").show();
    window.location = "/map/" + encodeURIComponent($(this).val());
  });
  $("#dateSelect").on("change.fs", function() {
    $(".loading").show();
    window.location = "/map/" + encodeURIComponent(deviceId) + "/" + encodeURIComponent($(this).val());
  });
  $("#routeSelect").on("change.fs", function() {
    $(".loading").show();
    window.location = "/map/" + encodeURIComponent(deviceId) + "/" + routeDate + "/" + encodeURIComponent($(this).val());
  });
  if (mapData.hasOwnProperty("points")) {
    var smoothed = smoothRoute(mapData);
    var mapOptions = {
      center: smoothed[0],
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      navigationControl: true,
      navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL }
    };
    var _map = new google.maps.Map($(".routeMap")[0], mapOptions);
    var line = new google.maps.Polyline({
      path: smoothed,
      strokeColor: "#00007f",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      map: _map
    });
  }

});