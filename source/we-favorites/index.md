---
title: 特效收藏馆
comments: true
---

<style rel="stylesheet" type="text/css">
.we-favorites-header {
  color: #bbbbbb;
  transition: all .4s ease;
}

.we-favorites-header:hover {
  color: #555;
}

.we-favorites {
  display: flex;
  flex-wrap: wrap;
}

.we-favorites .we-favorite {
  width: 278px;
  margin: 20px 10px 0;
  border-radius: 8px;
  overflow: hidden;
  transition: all .4s ease;
  border: 1px solid #e4ecf3;
}

.we-favorites .we-favorite:hover {
  transform: translateY(-6px);
  -webkit-transform: translateY(-6px);
  -moz-transform: translateY(-6px);
  box-shadow: 0 26px 40px -24px rgba(0,36,100,.5);
  -webkit-box-shadow: 0 26px 40px -24px rgba(0,36,100,.5);
  -moz-box-shadow: 0 26px 40px -24px rgba(0,36,100,.5);
}

.we-favorites .img-box {
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.we-favorites .we-favorite img{
  width: 100%;
  height: 100%;
  transition: all .4s ease;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
}

.we-favorites .we-favorite .img{
  width: 100%;
  height: 100%;
  transition: all .4s ease;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.we-favorites .we-favorite:hover .img {
  -webkit-transform: scale(1.2);
  transform: scale(1.2);
}

.we-favorites .we-favorite-title{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 10px;
  color: #313131;
  font-size: 14px;
  text-align: center;
}
@media (max-width: 567px) {
  .we-favorites .we-favorite {
    width: 100%;
  }
}
</style>

<h4 class="we-favorites-header" >据说，能完成下面任意一个效果的程序猿月薪都不会低于2W！</h4>
<div class="we-favorites" id="we-favorites"></div>

<script type="text/javascript">
(function (){
  var xhr=new XMLHttpRequest();
  xhr.onreadystatechange = function (){
    if(xhr.readyState === 4 && xhr.status === 200){
      var html = "";
      let list = JSON.parse(xhr.responseText).list || [];
      list.forEach(function (item){
        html += ('<a href="' + item.link + '" class="we-favorite" ' + (item.link.indexOf('javascript:') === -1? 'target="_blank"':'' ) + '>' +
        '  <div class="img-box">' +
        '      <div class="img" style="background-image:url(\'' + item.img + '\')"></div>' +
        '  </div>' +
        '  <div class="we-favorite-title">' + item.title + '</div>' +
        '</a>')
      });
      document.getElementById('we-favorites').innerHTML = html;
    }
  };
  xhr.open("GET",'https://wef.kai666666.top/index.json',true);
  xhr.send(null);
})();
</script>

