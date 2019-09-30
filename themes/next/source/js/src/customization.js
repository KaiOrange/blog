$(document).ready(function () {
  if ($env.isQuickAPP) {
    $("#header").hide();
    $("#main main-inner").css({marginTop:0,paddingTop:10});
    $("#github-corner svg").css({top:-80});
  } else if ($env.isPC) {
    // $("body").append('<script type="text/javascript" src="https://cdn.bootcss.com/canvas-nest.js/2.0.4/canvas-nest.js" ></script>');
    $("body").append('<script type="text/javascript" src="/lib/canvas-nest/canvas-nest.min.js"></script>');
  } else if ($env.isAndroid) {
    location.href = 'hap://app/top.kai666666.blog/Webview/url='+location.href
  }
});

