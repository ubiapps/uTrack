$(function() {
  var mapOptions = {
    center: new google.maps.LatLng(51.51541954569622,-0.14183521270751953),
    zoom: 8,
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
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 10,
    map: _map
  });
});