$(function() {
  var startPoint = new google.maps.LatLng(mapData[0].location.coords.latitude,mapData[0].location.coords.longitude);
  var mapOptions = {
    center: startPoint,
    zoom: 16,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    navigationControl: true,
    navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL }
  };
  var _map = new google.maps.Map($(".routeMap")[0], mapOptions);
  var routePath = mapData.map(function(el) {
    return new google.maps.LatLng(el.location.coords.latitude, el.location.coords.longitude);
  });
  var line = new google.maps.Polyline({
    path: routePath,
    strokeColor: "#00007f",
    strokeOpacity: 1.0,
    strokeWeight: 1,
    map: _map
  });
});