$(function() {
  $("#routeBtn").click(function(e) {
    e.preventDefault();
    var route = $("#routes").val();
    window.location = "/map/" + encodeURIComponent(deviceId) +  "/" + encodeURIComponent(route);
  });
});
