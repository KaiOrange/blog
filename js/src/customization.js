$(document).ready(function () {
  if ($env.isQuickAPP) {
    $("#header").hide();
    $("#main main-inner").css({marginTop:0,paddingTop:10});
    $("#github-corner svg").css({top:-80});
  } else if ($env.isPC) {
    $("body").append('<script type="text/javascript" src="/lib/canvas-nest/canvas-nest.min.js"></script>');
  }
});

