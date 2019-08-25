;var $env = (function (){
  var env = {
    isAndroid:false,
    isIOS:false,
    isQuickAPP:false,
    isPC
  };
  var userAgentInfo = navigator.userAgent;

  // isAndroid
  if (userAgentInfo.indexOf('Android') > 0) {
    env.isAndroid = true;
  }

  // isIOS
  if (userAgentInfo.indexOf('iPhone') > 0) {
    env.isIOS = true;
  }

  // isQuickAPP
  if (/hap\/.*top\.kai666666\./i.test(userAgentInfo)) {
    env.isQuickAPP = true;
  }

  // isPC
  var Agents = ["Android", "iPhone",
              "SymbianOS", "Windows Phone",
              "iPad", "iPod"];
  var isPC = true;
  for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
          isPC = false;
          break;
      }
  }
  env.isPC = isPC;

  return env
})();
