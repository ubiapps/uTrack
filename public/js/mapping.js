var _map;
var _mapOverlays = [];

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

var drawRoute = function(mapData) {
  // Clear any existing overlays.
  while (_mapOverlays.length > 0) {
    _mapOverlays.pop().setMap(null);
  }

  // Smooth the route data.
  var smoothed = smoothRoute(mapData);

  var line = new google.maps.Polyline({
    path: smoothed,
    strokeColor: "#00007f",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    map: _map
  });
  _mapOverlays.push(line);

  _map.setCenter(smoothed[0]);
  _map.setZoom(15);
};

var loadRoute = function(deviceId, routeDate, routeIndex) {
  $.ajax({
    url: "/api/" + deviceId + "/" + routeDate + "/" + routeIndex,
    cache: false
  }).done(function(routeData) {
      drawRoute(routeData);
    });
};

$(function() {
  var mapOptions = {
    center: new google.maps.LatLng(51.51541954569622,-0.14183521270751953),
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    navigationControl: true,
    navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL }
  };
  _map = new google.maps.Map($(".routeMap")[0], mapOptions);

  $("#journeySelector").click(function(evt) {
    evt.preventDefault();
    _routeDate = "";
    $(".routeDatesDropdown").hide();
    _routeIndex = -1;
    $(".routeIndexDropdown").hide();
    $(".routeSelectorDialog").modal("show");
  });

  $(".deviceSelector").click(function(evt) {
    evt.preventDefault();

    _deviceId = this.dataset["device"];
    $("#selectedDevice").html(decodeURIComponent(_deviceId) + "<b class='caret' />");
    $.ajax({
      url: "/api/" + _deviceId,
      cache: false
    }).done(function(routeDates) {
        $(".routeDatesDropdown").show();
        $(".routeDatesList").empty();
        for (var i = 0, len = routeDates.length; i < len; i++) {
          $(".routeDatesList").append("<li><a class='dateSelector' href='#' data-routedate='" + routeDates[i] + "'>" + routeDates[i] + "</a>");
        }
      });
  });

  $(document).on("click",".dateSelector",function(evt) {
    evt.preventDefault();

    _routeDate = this.dataset["routedate"];
    $("#selectedDate").html(_routeDate + "<b class='caret' />");
    $.ajax({
      url: "/api/" + _deviceId + "/" + _routeDate,
      cache: false
    }).done(function(routeIndices) {
        $(".routeIndexDropdown").show();
        $(".routeIndexList").empty();
        for (var i = 0, len = routeIndices.length; i < len; i++) {
          var route = routeIndices[i];
          $(".routeIndexList").append("<li><a class='routeSelector' href='#' data-routeindex='" + route.index + "'>" + route.distance.toFixed(1) + "m at " + new Date(route.start).toTimeString().substr(0,9) + "</a>");
        }
      });
  });

  $(document).on("click",".routeSelector",function(evt) {
    evt.preventDefault();

    _routeIndex = this.dataset["routeindex"];
    loadRoute(_deviceId, _routeDate, _routeIndex);
    $(".routeSelectorDialog").modal("hide");
  });

  if (_deviceId.length > 0 && _routeDate.length > 0 && _routeIndex >= 0) {
    loadRoute(_deviceId,_routeDate,_routeIndex);
  }
});