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

$(function() {
  var route = mapData.points;
  var startPoint = new google.maps.LatLng(route[0].location.coords.latitude,route[0].location.coords.longitude);
  var mapOptions = {
    center: startPoint,
    zoom: 16,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    navigationControl: true,
    navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL }
  };
  var _map = new google.maps.Map($(".routeMap")[0], mapOptions);
  var routePath = route.map(function(el) {
    return new google.maps.LatLng(el.location.coords.latitude, el.location.coords.longitude);
  });
  var line = new google.maps.Polyline({
    path: routePath,
    strokeColor: "#00007f",
    strokeOpacity: 0.8,
    strokeWeight: 1,
    map: _map
  });
});