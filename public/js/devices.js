$(function() {
  $("#deviceBtn").click(function(e) {
    e.preventDefault();
    var device = $("#devices").val();
    window.location = "/routes/" + encodeURIComponent(device);
  });
});
