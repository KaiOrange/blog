---
title: 文章热度排行
comments: false
---
<div id="top"></div>
<script src="https://cdn1.lncld.net/static/js/av-core-mini-0.6.4.js"></script>
<script>AV.initialize("5hMjWYdBcTn2DNzg8Np0EiDt-gzGzoHsz", "tmetR6q0QiHA7NnHo19uXnAX");</script>
<script type="text/javascript">
  var time=0
  var title=""
  var url=""
  var query = new AV.Query('Counter');
  query.notEqualTo('id',0);
  query.descending('time');
  query.limit(1000);
  query.find().then(function (todo) {
    for (var i=0;i<1000;i++){
      var result=todo[i].attributes;
      time=result.time;
      title=result.title;
      url=result.url;
      var content="<font color='#555'>"+"【热度："+time+"℃】</font>"+"<a href='"+"https://www.kai666666.com"+url+"'>"+title+"</a>"+"<br />";
      document.getElementById("top").innerHTML+=content
    }
  }, function (error) {
    console.log("error");
  });
</script>

<style>.post-description { display: none; }</style>

