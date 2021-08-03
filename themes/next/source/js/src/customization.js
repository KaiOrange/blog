$(document).ready(function () {
  if ($env.isQuickAPP) {
    $("#header").hide();
    $("#main main-inner").css({marginTop:0,paddingTop:10});
    $("#github-corner svg").css({top:-80});
  } else if ($env.isPC) {
    // $("body").append('<script type="text/javascript" src="https://cdn.bootcss.com/canvas-nest.js/2.0.4/canvas-nest.js" ></script>');
    $("body").append('<script async type="text/javascript" src="/lib/canvas-nest/canvas-nest.min.js"></script>');
  } else if ($env.isAndroid) {
    var isFirstBrowse = localStorage.getItem('isFirstBrowse') !== 'false';
    // 非第一次浏览有30%的概率试图去唤起快应用
    if (isFirstBrowse || Math.floor(Math.random() * 10) < 4) {
      var url = 'hap://app/top.kai666666.blog';
      if (location.pathname && location.pathname !== '/') {
        url = 'hap://app/top.kai666666.blog/Webview?url='+ encodeURIComponent(decodeURIComponent(location.href));
      }
      localStorage.setItem('isFirstBrowse','false');
      location.href = url;
    }
  }
});

