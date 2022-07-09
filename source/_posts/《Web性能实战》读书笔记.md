---
title: 《Web性能实战》读书笔记
date: 2022-06-04 12:42:26
author: Orange
tags:
  - JavaScript
categories: 读书笔记
---

Web性能调优一直是高级前端必须掌握的技能，市面上不少书简绍性能调优的书总是告诉读者一些理论性的东西，而如何去实践说的却不多，这本书不仅告诉读者Web性能优化的理论知识，同时还会告诉读者怎么用node去设置，是一本前端进阶必看的书。

![《Web性能实战》](1.jpg)

----

## 理解Web性能 ##

**Web性能**主要指网站的加载速度。你可以通过提高网站速度来加快内容的传输，从而改善用户的体验。电子商务网站上近一半的用户希望在2秒内完成。如果加载时间超过3秒，40%的用户将会退出。页面相应时间每延迟1秒就意味着7%的用户不再进一步操作。

**加载时间**是用户请求网站到网站出现在用户屏幕上所经历的时间。

本节从减少传输的数据量入手，简单的简绍了3中提高性能的方法：缩小资源、使用服务器压缩、压缩图像。

缩小（minification）文本资源是从基于文本的资源中去除所有空白和非必要字符的过程，因而不会影响资源的工作方式。

### 缩小资源 ###

下面命令`-o`表示输入的文件路径，通过使用下面命令缩小资源后 CSS文件缩小了14%，JS文件缩小了66%，HTML缩小了19%，缩小的还是挺可观的。

```shell
# 缩小CSS
minify -o styles.min.css styles.css
# 缩小JS
minify -o jquery.min.js jquery.js
# 缩小HTML
htmlminify -o index.html index.src.html
```

### 使用服务器压缩 ###

服务器压缩的工作方式是用户从服务器请求网页，用户的请求会附带一个`Accept-Encoding`的头信息，向服务器告知浏览器可以使用的压缩格式。如果服务器按照`Accept-Encoding`头信息中的内容进行编码，它将用一个`Content-Encoding`响应头信息进行回复，其值是所使用的压缩方式。`gzip`是比较常用的一种压缩格式，express服务配置`gzip`如下。

```JavaScript
var express = require("express");
// 需要运行 npm install compression 安装compression
var compression = require("compression");
var app = express();

// 使用compression中间件
app.use(compression());
app.use(express.static(__dirname));
app.listen(8080);
```

通过上述两行代码，压缩后资源缩小了66%。

### 压缩图像 ###

压缩图像书中简绍了使用常用的[TinyPNG](https://tinypng.com/)去压缩，大小缩小了60%左右。

通过这三种方式，网站的加载速度提高了近70%，还是非常可观的。

## 使用评估工具 ##

第一个评估工具就是[Google PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/)，去该网站输入你要分析的网站，它会给你一些优化的建议，当然网页得是已经在线上跑的网页，另外国内需要翻墙。

第二个评估工具是[Google Analytics](https://www.google.com/analyties/)，这个工具比较全面，但是需要在网页中注入JS脚本，如果是大公司的开发者，注入Google的代码往往需要走法律审查，因为安装跟踪代码时，需要接受法律协议条款。

**首字节时间（Time to First Byte,TTFB）**：从用户请求网页到相应第一个字节到达之间的时间。首字节时间往往跟队列请求、DNS查找、连接设置和SSL握手等有关。

页面创建过程：解析HTML以创建DOM -> 解析CSS以创建CSSOM -> 布局元素 -> 绘制页面。

## 优化CSS ##

### 移动优先 ###

**移动优先响应式设计**：默认样式为移动设备定义，并且随着屏幕宽度的增大而增加复杂性。
**桌面优先响应式设计**：默认样式为桌面设备定义，并且随着屏幕宽度的减小而降低复杂性。

通常响应式设计中使用移动优先的响应式设计会更好一点，主要的原因有：
1.通常移动设备的处理能力和内存通常低于桌面设备，使用移动优先不需要解析媒体查询。
2.从开发角度出发，扩大样式规模更容易实现。
3.手机用户量激增，搜索引擎对移动设备逐渐更友好。

### 避免使用@import声明 ###

CSS中可以使用@import来引入一个样式，使用方式如下：

```CSS
@import url(fonts.css);
```

最好不要使用`@import`来引入一个样式，因为`@import`是串行的，会增加页面的总体加载和渲染时间。可以使用`<link>`标签来代替，因为`<link>`标签是并行的。
Less中的`@import`最终编译到css中的并不是CSS语法中的`@import`，所以可以使用。

### 在&lt;head&gt;中放置CSS ###

在`<head>`标签中放置CSS要比在`<body>`标签中放置CSS有两个好处：

1. 无样式内容闪烁的问题；
2. 加载时提高页面的渲染性能。

如果CSS放在`<body>`标签中，如果放在页面HTML结构的下方那么就会先渲染一个没有自定义样式的页面，等加载完CSS以后才会有自定义样式，所以会有无样式内容闪烁的问题。
放在`<body>`中还有一个问题是页面加载完`<body>`中的样式以后会重新渲染和绘制整个DOM，页面渲染性能较差。

### 使用CSS过渡 ###

CSS过渡的优点：

1. 广泛支持；
2. 回流复杂DOM时，CPU的使用效率更高；
3. 无额外开销。

如果动画可以使用CSS过渡来实现的话，最好使用CSS过渡而不是JS来改变DOM（减少回流）。

### 使用will-change来优化过渡 ###

will-change使用方法：

```CSS
will-change: 属性1, [属性2]...

/* 如： */
will-change: background-color;
```

will-change可以告诉浏览器哪个属性将会过渡，但是不要使用`will-change: all;`。

其他的优化点：

1. 使用简写属性；
2. 使用CSS潜选择器；
3. 分割CSS不加载当前页面中不会显示的CSS；
4. 尽可能使用flexbox布局。

### 关键CSS技术 ###

关键CSS，即折叠之上的内容，这些是用户会立即看到的内容，需要尽快加载。
非关键CSS，即折叠之下的内容，这些是用户开始向下滚动页面之前看不到的内容样式，这种CSS也应该尽快加载，但不能在关键CSS之前加载。

书中的折叠是指屏幕的底部，实际上关键CSS就是首屏样式，非关键CSS就是非首屏的样式。

渲染阻塞指的是阻止浏览器将内容绘制到屏幕的任务活动，这是Web中不可避免的事情。无论使用`<link>`还是`@import`引入样式都会产生渲染阻塞（虽然`<link>`下载是并行的）。

加载首屏样式：为了减少渲染阻塞时间可以直接把关键CSS样式放在`<style>`标签中。

加载非首屏样式：非首屏样式也会遇到渲染阻塞的问题，可以使用preload来减少阻塞渲染时间。

```HTML
<link rel="preload" href="index.css" as="style" onload="this.rel='stylesheet'">
  <noscript>
    <link rel="stylesheet" href="index.css" />
  </noscript>
</link>
```

## 响应式图像 ##

### 通过媒体查询来适配高DPI显示器 ###

```CSS
/* 正常屏幕 */
#masthead {
  background-image: url("../img/masthead-small.jpg");
}

/* 高分别率 */
@media screen (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) and (min-width: 44em){ /* High DPI 704px/16px */
  #masthead {
    background-image: url("../img/masthead-small.jpg");
  }
}

@media screen (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) and (min-width: 56em){ /* High DPI 896px/16px */
  #masthead {
    background-image: url("../img/masthead-medium.jpg");
  }
}

@media screen (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) and (min-width: 77em){ /* High DPI 1232px/16px */
  #masthead {
    background-image: url("../img/masthead-large.jpg");
  }
}
```

`-webkit-min-device-pixel-ratio`是旧的浏览器对高DPI的支持，如果比率是1相当于是96DPI，2相当于是192DPI；`min-resolution`是现代浏览器所支持的直接显示值就行了，最后`min-width`根据屏幕的宽度来加载不同大小的图片。

### CSS中使用SVG ###

CSS可以直接把SVG当做图片来使用，实际上本身也可以看成图片：

```CSS
background-image: url(../img/masthead.svg);
```

### HTML中传输图片 ###

图片全局max-width规则：在响应式网站中图片往往最大是屏幕的宽度，所以显示最大宽度100%会很有用的。

```CSS
img {
  max-width: 100%;
}
```

商品可以通过媒体查询根据设备分别率来使用不同的图片，实际上H5中，img标签的srcset和sizes属性也可以实现类似的功能。srcset可以根据屏幕的宽度来加载不同的图片。sizes可以通过屏幕的宽度设置图片的宽度，如下。

```HTML
<img
  src="img/amp-xsmall.jpg"
  class="articleImageFull"
  srcset="img/amp-small.jpg 512w,
         img/amp-medium.jpg 768w,
         img/amp-large.jpg 1280w"
  sizes="(min-width: 704px) 50vw, (min-width: 480px) 75vw, 100vw"
/>
```

上述代码中在512px像素宽度的时候图片是`img/amp-small.jpg`，768px像素宽度的时候图片是`img/amp-medium.jpg`，1280px像素宽度的时候图片是`img/amp-large.jpg`，可见后面的w指的是屏幕宽度为多少。同样的在最小宽度704px的时候图片的宽度是宽度的50%，最小宽度是480px的时候图片的宽度是75%，最小宽度更小的时候图片的宽度是100%。

如果需要在相同的宽度的时候，根据设备分别率来显示不同的图片，那么srcset和sizes就不能做了，此时可以考虑功能更强大的picture标签，如下。

```HTML
<picture>
  <source
    media="(min-width: 704px)"
    srcset="img/apm-medium.jpg 348w,img/amp-large.jpg 512w"
    sizes="33.3vw"
  >
  <source
    srcset="img/apm-cropped-small.jpg 1x,img/amp-cropped-medium.jpg 2x"
    sizes="75vw"
  >
  <img src="img/amp-small.jpg">
</picture>
```

可以使用type属性来加载webp图片，如下。如果支持的话使用图片`img/apm-small.webp`，不支持的话使用图片`img/amp-small.jpg`。

```HTML
<picture>
  <source srcset="img/apm-small.webp" type="webp">
  <img src="img/amp-small.jpg">
</picture>
```

picture很好用，如果不支持的时候可以走img标签做兜底处理，如果在低版本浏览器也希望使用picture标签该怎么办，就得靠[picturefill](https://github.com/scottjehl/picturefill)了，使用方式如下。下面第一个script用来创建一个picture元素，防止因为没有该元素而导致解析错误，第二个script用来异步下载库文件。

```JavaScript
<script>document.createElement("picture");</script>
<script src="js/picturefill.min.js" async></script>
```

## 图像的进一步处理 ##

### 使用雪碧图 ###

雪碧图的好处：将大量图片缩减为单个图片，可以更加高效地传递资源，并通过减少到Web服务器的连接数来缩短页面的加载时间。

注：使用雪碧图可以减少HTTP请求，但在HTTP2中是反模式。

生成雪碧图：

```Shell
npm install -g svg-sprite
svg-sprite -css -css-render-less -css-dest=less -css-sprite=../img/icons.svg --css-layout=diagonal img/icon-images/*.svg
```

将雪碧图回退为图片可以使用这个工具：[https://github.com/filamentgroup/grumpicon](https://github.com/filamentgroup/grumpicon)

### 缩小图像 ###


书中减少使用imagemin来缩小图片jpeg和png的图片，同时也支持生成webp图片： [https://github.com/imagemin/imagemin](https://github.com/imagemin/imagemin)

imagemin提供了大量的插件：[https://www.npmjs.com/search?q=keywords:imageminplugin](https://www.npmjs.com/search?q=keywords:imageminplugin)

使用svgo来压缩svg图片：[https://github.com/svg/svgo](https://github.com/svg/svgo)

### 使用懒加载 ###

懒加载简单实现：

```JavaScript
(function(window, document){
  "use strict";
  // 懒加载对象
  var lazyLoader = {
    lazyClass: "lazy",
    images: null,
    processing: false,
    throttle: 200,
    buffer: 50,
    // 初始化
    init: function(){
      lazyLoader.images = [].slice.call(document.getElementsByClassName(lazyLoader.lazyClass));
      lazyLoader.scanImages();
      document.addEventListener("scroll", lazyLoader.scanImages);
      document.addEventListener("touchmove", lazyLoader.scanImages);
    },
    // 销毁
    destroy: function(){
      document.removeEventListener("scroll", lazyLoader.scanImages);
      document.removeEventListener("touchmove", lazyLoader.scanImages);
    },
    // 扫描图片
    scanImages: function(){
      if(document.getElementsByClassName(lazyLoader.lazyClass).length === 0){
        lazyLoader.destroy();
        return;
      }

      if(lazyLoader.processing === false){
        lazyLoader.processing = true;

        setTimeout(function(){
          for(var i in lazyLoader.images){
            if(lazyLoader.images[i].className.indexOf("lazy") !== -1){
              if(lazyLoader.inViewport(lazyLoader.images[i])){
                lazyLoader.loadImage(lazyLoader.images[i]);
              }
            }
          }

          lazyLoader.processing = false;
        }, lazyLoader.throttle);
      }
    },
    // 判断图片是否出现在屏幕上
    inViewport: function(img){
      var top = ((document.body.scrollTop || document.documentElement.scrollTop) + window.innerHeight) + lazyLoader.buffer;
      return img.offsetTop <= top;
    },
    // 加载图片
    loadImage: function(img){
      if(img.parentNode.tagName === "PICTURE"){
        var sourceEl = img.parentNode.getElementsByTagName("source");

        for(var i = 0; i < sourceEl.length; i++){
          var sourceSrcset = sourceEl[i].getAttribute("data-srcset");

          if(sourceSrcset !== null){
            sourceEl[i].setAttribute("srcset", sourceSrcset);
            sourceEl[i].removeAttribute("data-srcset");
          }
        }
      }

      var imgSrc = img.getAttribute("data-src"),
        imgSrcset = img.getAttribute("data-srcset");

      if(imgSrc !== null){
        img.setAttribute("src", imgSrc);
        img.removeAttribute("data-src");
      }

      if(imgSrcset !== null){
        img.setAttribute("srcset", imgSrcset);
        img.removeAttribute("data-srcset");
      }

      lazyLoader.removeClass(img, lazyLoader.lazyClass);
    },
    // 移除样式
    removeClass: function(img, className){
      var classArr = img.className.split(" ");

      for(var i = 0; i < classArr.length; i++){
        if(classArr[i] === className){
          classArr.splice(i, 1);
        }
      }

      img.className = classArr.toString().replace(",", " ");
    }
  };

  // 启动初始化程序
  document.onreadystatechange = lazyLoader.init;
})(window, document);
```

上述懒加载的使用：图片上添加lazy样式，同时使用data-src代替src，src使用默认未加载图片来代替，如：

```HTML
<img src="img/blank.png" data-src="img/red-snapper-1x.jpg" class="recipeImage lazy">
```

## 更快的字体 ##

将ttf字体转换为其他字体：

```Shell
npm install -g ttf2eot ttf2woff ttf2woff2
ttf2eot OpenSans-Light.ttf OpenSans-Light.eot
ttf2woff OpenSans-Light.ttf OpenSans-Light.woff
cat OpenSans-Light.ttf | ttf2woff2 >> OpenSans-Light.woff2
```

CSS中使用自定义字体：

```CSS
/* 定义字体 */
@font-face{
  font-family: "Open Sans Light";
  font-weight: 300;
  font-style: normal;
  src:
    local("Open Sans Extra Light"),
    local("OpenSans-Light"),
    url("open-sans/OpenSans-Light.woff2") format("woff2"),
    url("open-sans/OpenSans-Light.woff") format("woff"),
    url("open-sans/OpenSans-Light.eot") format("embedded-opentype"),
    url("open-sans/OpenSans-Light.ttf") format("truetype");
}

.font-osl {
  /* 使用字体 */
  font-family: "Open Sans Light";
}
```

使用unicode-range加载字体子集，如下面把`Open Sans Light`拆分成BasicLatin部分和Cyrillic部分，使用`unicode-range`定义字符范围，如果文字中只有BasicLatin部分那么只会下载上面的文字，如果只有Cyrillic的文字那么下载下面的文字，都有会都下载。

```CSS
@font-face{
  font-family: "Open Sans Light";
  font-weight: 300;
  font-style: normal;
  src:
      url("open-sans/OpenSans-Light-BasicLatin.woff2") format("woff2"),
      url("open-sans/OpenSans-Light-BasicLatin.woff") format("woff"),
      url("open-sans/OpenSans-Light-BasicLatin.eot") format("embedded-opentype"),
      url("open-sans/OpenSans-Light-BasicLatin.ttf") format("truetype");
  unicode-range: U+0000-007F;
}

@font-face{
  font-family: "Open Sans Light";
  font-weight: 300;
  font-style: normal;
  src:
      url("open-sans/OpenSans-Light-Cyrillic.woff2") format("woff2"),
      url("open-sans/OpenSans-Light-Cyrillic.woff") format("woff"),
      url("open-sans/OpenSans-Light-Cyrillic.eot") format("embedded-opentype"),
      url("open-sans/OpenSans-Light-Cyrillic.ttf") format("truetype");
  unicode-range: U+0400-045F,U+0490-0491,U+04B0-04B1;
}

.font-osl {
  /* 使用字体 */
  font-family: "Open Sans Light";
}
```

字体下载和字体实际显示直接可能有一段时间，那么这段时间内的字体是怎么显示呢？可以使用font-display来控制：

`font-display: auto;` 默认值，类似于block。
`font-display: block;` 阻塞文本渲染，直到关联的字体加载完成。
`font-display: swap;` 显示回退文本，加载字体后显示自定义字体。
`font-display: fallback;` auto和swap的折中方案，短时间（100ms）内显示空白，之后显示回退文本，如果字体加载完后，显示自定义字体。
`font-display: optional;` 几乎和fallback一样，只是浏览器有更大的自由度来控制。

但是`font-display`并未得到广泛的支持，使用JS来做回退处理：

```JavaScript
(function(document){
  if(document.fonts && document.cookie.indexOf("fonts-loaded") === -1){
    document.fonts.load("1em Open Sans Light");
    document.fonts.load("1em Open Sans Regular");
    document.fonts.load("1em Open Sans Bold");

    document.fonts.ready.then(function(fontFaceSet){
      document.documentElement.className += " fonts-loaded";
      document.cookie = "fonts-loaded=";
    });
  } else {
    // 添加一个fonts-loaded样式 需要字定义CSS有该样式的时候才使用字体
    document.documentElement.className += " fonts-loaded";
  }

})(document);
```

## 保持JavaScript的简洁与快速 ##

script标签会阻塞页面的渲染，放在body最后面有助于加快页面加载速度。

script带有async属性与不带async的区别：
不带async：下载脚本->脚本下载完成->浏览器等待其他脚本->执行脚本
带有async：下载脚本->脚本下载完成->执行脚本

带有async脚本下载完会立即执行而不会阻塞渲染。

使用async时需要注意，async下载完会立即执行那么，有可能执行的顺序跟script标签的顺序不同，从而导致JS执行报错。如有一个jquery.min.js文件，还有一个behaviors.js文件，其中behaviors.js引用到jquery.min.js中的$（jQuery对象），那么两个都用async就可能就会在behaviors.js中的$出现没有定义的情况。

解决方法：
1.可以把两个文件文件合并成一个

```shell
# linux 合并两个文件：
cat jquery.min.js jquery.min.js > script.js
# windows 合并两个文件：
type jquery.min.js jquery.min.js > script.js
```

2. 使用AMD：https://github.com/requirejs/alameda

```HTML
<script src="js/alameda.js" data-main="js/behaviors" async >
```

```JavaScript
// js/behaviors.js 中使用AMD模块
requirejs.config({
  paths: {
    jquery: 'juqery.min'
  }
});

require(['jquery'], function($) {
  // 其他代码

});
```

3. 使用defer。

书中还简绍了jQuery的替代方案和用原生JS代替jQury，现在MVVM时代很少用jQuery了，就不简绍了，原生方案可以看这里：[https://github.com/nefe/You-Dont-Need-jQuery](https://github.com/nefe/You-Dont-Need-jQuery)。

## 使用Service Worker提升性能 ##

Service Worker在单独的线程上工作，无法访问window对象，但可以通过中介（如postMessage API）间接访问。

使用方式：

1. 注册Server Worker

```JavaScript
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}
```

2. 编写Server Worker代码

```JavaScript
// 文件/sw.js

// 案例1，添加资源的离线缓存
var cacheVersion = "v2",
    cachedAssets = [
        "/css/global.css?v=1",
        "/js/debounce.js",
        "/js/nav.js",
        "/js/attach-nav.js",
        "/img/global/jeremy.svg",
        "/img/global/icon-github.svg",
        "/img/global/icon-email.svg",
        "/img/global/icon-twitter.svg",
        "/img/global/icon-linked-in.svg",
    ];
// 添加缓存
self.addEventListener("install", function(event) {
  event.waitUntil(caches.open(cacheVersion).then(function(cache) { // chashes -> caches
      return cache.addAll(cachedAssets); // chache -> cache
  }).then(function() {
      return self.skipWaiting();
  }));
});

// skipWaiting 的时候会触发
self.addEventListener("activate", function(){
    return self.clients.claim();
});

// 案例2，拦截并缓存网络请求
self.addEventListener("fetch", function(event) {
  var allowedHosts = /(localhost|fonts\.googleapis\.com|fonts\.gtatic\.com)/i,
  deniedAssets = /(sw\.js|sw-install\.js)$/i,
  htmlDocument = /(\/|\.html)$/i;
  if(allowedHosts.test(event.request.url) === true && deniedAssets.test(event.request.url) === false) {
      if (htmlDocument.test(event.request.url) === true) {
          event.respondWith(
              fetch(event.request).then(function(response) {
                  caches.open(cacheVersion).then(function(cache) {
                      cache.put(event.request, response.clone());
                  });
                  return response;
              }).catch(function() {
                  return caches.match(event.request);
              })
          );
      } else {
          event.respondWith(
              caches.match(event.request).then(function(cachedResponse) {
                  return cachedResponse ||
                  fetch(event.request).then(function(fetchedResponse) {
                      caches.open(cacheVersion).then(function(cache) {
                          cache.put(event.request, fetchedResponse);
                      });
                      return fetchedResponse.clone();
                  });
              })
          );
      }
  }
});

// 案例3，清理缓存
self.addEventListener("activate", function(event) {
  var chacheWhitelist = ["v2"];
  event.waitUnitil(
      caches.keys().then(function(keyList) {
          return Promise.all([
              keyList.map(function(key){
                  if(chacheWhitelist.indexOf(key) === -1){
                      return caches.delete(key);
                  }
              }), selfclients.claim()
          ]);
      })
  );

});
```

## 微调资源传输 ##

上面在使用gzip的时候使用了`compression`中间件，实际上`compression`是支持传入压缩等级的 范围是0~9，默认是6，但并不是越高越好，往往默认值的效果是比较好的。
另外`compression`也支持压缩特定的资源，可以使用filter，返回为true的时候表示压缩，false不压缩。

```JavaScript
app.use(compression({
  level: 7,
  filter: function (request, response) {
    // 一般是根据request来判断，这里直接返回true则都压缩
    return true;
  }
}));
```

### 使用Brotli压缩 ###

`Accept-Encoding`中如果有`br`说明支持Brotli压缩，express可以使用`shrink-ray`来开启Brotli压缩。

```JavaScript
// 假设你已经运行过: npm install https shrink-ray
var express = require("express"),
  https = require("https"),
  shrinkRay = require("shrink-ray"),
  fs = require("fs"),
  path = require("path"),
  app = express(),
  pubDir = "./htdocs";

app.use(shrinkRay({
  // 缓存设置可以换成 false 表示不开启，书中为了测试性能把缓存关了
  cache: function(request, response){
    return false;
  },
  brotli: {
    quality: 11
  }
}));

app.use(express.static(path.join(__dirname, pubDir)));

https.createServer({
  key: fs.readFileSync("crt/localhost.key"),
  cert: fs.readFileSync("crt/localhost.crt")
}, app).listen(8443);
```

brotli中的quality范围为0~11，值越大文件越小，默认是4，一般也够用了。

### 设置缓存 ###

设置Cache-Control头部的max-age指令

```JavaScript
app.use(express.static(path.join(__dirname, pubDir), {
  maxAge: '10s',
}));
```

响应头会带有：`Cache-Control: max-age=10`，注意max-age的单位是秒。

`Cache-Control：no-cache`: 向浏览器表明，下载的任何资源都可以储存在本地，但浏览器必须始终通过服务器重新验证资源。
`Cache-Control：no-store`: 比`no-cache`更近一步，它表示浏览器不应存储受影响的资源。要求浏览器每次访问页面时下载所有受影响的资源。
`Cache-Control：stale-while-revalidate=10`: 与`max-age`类似，单位也是秒，当资源过期后仍然使用过期的资源，同时发出请求并缓存新的资源，下次再请求的时候使用新的资源。

在CDN的`Cache-Control`有时会与`privite`和`public`连用，如`Cache-Control: privite, max-age=10`，其中privite表示中介（CDN）不在其服务器上缓存资源，public则缓存。

对不同资源设置不同的缓存策略：

资源类型|修改频率|Cache-Control头部值
---|---|---
HTML| 可能频繁修改，但需要尽可能保持最新 | private, no-cache, max-age=3600
CSS和JS| 可能每月修改 | public, max-age=2592000
图片| 几乎不会修改 | public, max-age=31536000,

代码实现：

```JavaScript
app.use(express.static(path.join(__dirname, pubDir), {
  setHeaders: function(res, path){
    var fileType = mime.lookup(path);

    switch(fileType){
      case "text/html":
        res.setHeader("Cache-Control", "private, no-cache, max-age=" + (60*60));
      break;

      case "text/javascript":
      case "application/javascript":
      case "text/css":
        res.setHeader("Cache-Control", "public, max-age=" + (60*60*24*30));
      break;

      case "image/png":
      case "image/jpeg":
      case "image/svg+xml":
        res.setHeader("Cache-Control", "public, max-age=" + (60*60*24*365));
      break;
    }
  }
}));
```

### 资源提示 ###

preconnect、prefetch与preload的使用：

```HTML
<link ref="preconnect" src="https://code.jquery.com">
<link ref="prefetch" src="https://code.jquery.com/jquery-2.2.4.min.js" as="script">
<link ref="preload" src="https://code.jquery.com/jquery-2.2.4.min.js" as="script">
```

preconnect可以提供更早的DNS查询，但是如果跟HTML是同域名的时候是没用什么用的，因为已经查询过DNS了，preconnect主要是为了查询其他域名，由于HTML是自上而下解析的，通常把preconnect放在HTML的head中的上面的位置。

prefetch告诉浏览器下载特定的资源，并将其存储到浏览器缓存中。通常用来预取同一个页面的资源，或者优先缓存下一页的资源。缓存下一页的资源使用时要小心，不要下载下页没有的资源，否则会造成过多的请求。

preload如果没有as属性，可能会导致请求2次的情况，另外preload只会缓存本页面的资源。

## HTTP2未来展望 ##

HTTP1的问题：

1. **队头阻塞**：HTTP1无法处理超过一小批的请求（通常认为是6个，因浏览器而异）。请求按接收顺序响应，在初始批处理中的所有请求完成之前，无法开始新的请求。如总共有9个任务，第一批会一次性加载6个，得等这6个中最慢的加载完后才会加载下一批的剩余3个请求。可以通过域名分片（不同域名加载不同批的资源）来处理，但实现起来比较繁琐。
2. **未压缩头部**：之前zip、br等压缩处理压缩的都是响应体，但是头部信息不能压缩，而有的时候头部信息甚至比响应体更大。
3. **不安全网站**：HTTP1可以不用实现SSL。

HTTP2对上述问题的处理

1. **不再有队头阻塞**：HTTP2通过实现新的通信体系结构来并行满足更多请求。新的信道使用一个连接并行处理多个请求，连接的构成：
**流**是服务器和浏览器之间的双向通信通道，一个连接可以有多个流。
**消息**由流封装，单个消息相当于HTTP1的一次请求或一次响应。
**帧**由消息封装，帧是消息的分割符。如响应消息中的HEADERS帧表明下一数据表示响应的HTTP头，响应消息中的DATA帧表示下一数据是所请求的内容。
2. **头部压缩**：使用了HPACK压缩算法来解决这个问题，不仅压缩头部数据还通过创建一个表来存储重复的头部，以删除多余的头部。
3. **强制HTTPS**：HTTP2必须实现SSL，因此HTTP2一定是HTTPS。

HTTP2对不支持HTTP2的浏览器的处理：每个HTTP2服务器底层都应有一个HTTP1服务器在等待一个不支持HTTP2的客户端出现。

HTTP2的简单使用：

```JavaScript
var fs = require("fs"),
  path = require("path"),
  http2 = require("spdy"),
  mime = require("mime"),
  jsdom = require("jsdom"),
  pubDir = path.join(__dirname, "/htdocs");

var server = http2.createServer({
  key: fs.readFileSync(path.join(__dirname, "/crt/localhost.key")),
  cert: fs.readFileSync(path.join(__dirname, "/crt/localhost.crt"))
}, function(request, response){
  var filename = path.join(pubDir, request.url),
    contentType = mime.lookup(filename),
    protocolVersion = request.isSpdy ? "http2" : "http1";

  // 设置缓存响应头
  if((filename.indexOf(pubDir) === 0) && fs.existsSync(filename) && fs.statSync(filename).isFile()){
    response.writeHead(200, {
      "content-type": contentType,
      "cache-control": "max-age=3600"
    });

    // http1 的回退处理
    if(protocolVersion === "http1" && filename.indexOf(".html") !== -1){
      fs.readFile(filename, function(error, data){
        jsdom.env(data.toString(), function(error, window){
          window.document.documentElement.classList.add(protocolVersion);

          var scripts = window.document.querySelectorAll("script:not([crossorigin])"),
            jQueryScript = window.document.querySelector("script[crossorigin]"),
            concatenatedScript = window.document.createElement("script");
            concatenatedScript.src = "js/scripts.min.js";

          for(var i in scripts){
            scripts[i].remove();
          }

          jQueryScript.parentNode.insertBefore(concatenatedScript, jQueryScript.nextSibling);

          var newDocument = "<!doctype html>" + window.document.documentElement.outerHTML;
          response.end(newDocument);
        });
      });
    } else{
      // http2 流
      var fileStream = fs.createReadStream(filename);
      fileStream.pipe(response);
      fileStream.on("finish", response.end);
    }
  } else{
    response.writeHead(404);
    response.end();
  }
});

server.listen(8443);
```

