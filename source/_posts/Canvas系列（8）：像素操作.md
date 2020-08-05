---
title: Canvas系列（8）：像素操作
date: 2019-06-29 10:39:05
author: Orange
tag:
	- Canvas
categories: Canvas
---

经常拍照的同学会使用图片处理软件，给自己的照片加上各种效果。图片处理软件也是软件，同样也是由代码写的，那么如何实现图片处理呢，这章我们就探讨一下这个问题。

----

canvas中像素处理涉及到3个方法，我们先来看一下API吧：

```JavaScript
// 1. 获取ImageDate 参数是左上角的左边(sx, sy)以及获取像素的宽度sw 和 高度sh
// 他返回一个ImageData对象
context.getImageData(sx, sy, sw, sh);

// 2. 将处理后的ImageData设置到canvas中 由于是覆盖了canvas其中部分区域
// 所以用的是put而不是set（并没有setImageData，put全部覆盖就可以相当于set）
context.putImageData(imagedata, dx, dy);
// 该方法还有可选参数
context.putImageData(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);

// 3. 创建一个宽width 高height的ImageData对象
context.createImageData(width, height);
// 也可以根据已有的ImageData对象来创建
context.createImageData(imagedata);
```

这几个API中，过来过去绕不过一个对象就是`ImageData`，`ImageData`对象到底是什么呢？他是一个描述了图片信息的对象，拥有三个属性：`width`、`height`、`data`。其中`width`、`height`就不用说了，分别是图片的宽度和高度，重点是这个`data`属性，他是一个`Uint8ClampedArray`对象，这个对象没听过？完全没问题，你就把他当做数组来处理，就可以了。这个“数组”是一个很长很长的一维数组，内容大概是`[r0,g0,b0,a0,r1,g1,b1,a1...]`这种形式的，其中`r0,g0,b0,a0`分别是图片左上角第一个像素的红绿蓝和透明度的值，后面分别是第二个像素，第三个像素等等的值。其中rgbb取值都是`0~255`，a如果是255表示不透明，之所以不按100来算是为了处理起来方便。

## 底片效果 ##

在写底片效果代码之前我们先绘制一张图片。

```JavaScript
var image = new Image();
image.src = "lufei.jpeg";
image.onload = function (){
  context.drawImage(image, 0, 0,image.width / 2, image.height / 2);
}
```

由于我们的图片比较大，我们就缩小一半来展示（虽然此时图片仍然未显示完，不过不影响），此时的效果是这个样子的：

![初始值](1.jpeg)

现在做底片处理：

```JavaScript
var image = new Image();
image.src = "lufei.jpeg";
image.onload = function (){
  context.drawImage(image, 0, 0,image.width / 2, image.height / 2);
  var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  // 获取像素数据
  var data = imageData.data;
  // 循环每次加4表示一个一个像素的处理，这个是常用套路
  for (var i = 0; i < data.length; i+=4) {
    data[i + 0] = 255 - data[i + 0];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  // 设置像素数据
  context.putImageData(imageData, 0, 0);
}
```

[出来的效果如下](https://canvas-demo.kai666666.top/08/01.html)

![底片效果](2.jpeg)

你或许会问为什么`putImageData`没有传入图片的宽度和高度呢，其实`ImageData`对象中本来就有高度和宽度，所以就无需传入了。另外还有一点需要注意，如果你在`getImageData`的时候控制台报这样的错误说明你跨域了：

> Uncaught DOMException: Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The canvas has been tainted by cross-origin data.

`getImageData`不允许访问非本域的图片，解决办法是自己启动一个服务，比如是用`anywhere`，使用方法就是在你的`index.html`所在的目录下的，使用终端输入下面两行命令，这样就可以使用服务打开了，记得把图片放在同一级目录下，图片在[这里](lufei.jpeg)，点右键另存为同级目录下就可以了

```shell
npm install -g anywhere
anywhere
```

## 黑白效果 ##

直接上代码：

```JavaScript
var image = new Image();
image.src = "lufei.jpeg";
image.onload = function (){
  context.drawImage(image, 0, 0,image.width / 2, image.height / 2);
  var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  // 获取像素数据
  var data = imageData.data;
  // 循环每次加4表示一个一个像素的过，这个是常用套路
  for (var i = 0; i < data.length; i+=4) {
    var average = ( data[i + 0] + data[i + 1] + data[i + 2] ) / 3;
    data[i + 0] = average;
    data[i + 1] = average;
    data[i + 2] = average;
  }
  // 设置像素数据
  context.putImageData(imageData, 0, 0);
}
```

正如你看到的，像素处理都是一个模式，只是把中间处理像素的算法换了一下，[此时的效果如下](https://canvas-demo.kai666666.top/08/02.html)，是不是很酷？

![黑白效果](3.jpeg)

当然黑白效果还可以使用加权平均数来处理，这种网上推崇的比较多，毕竟上面这种比较泛白，处理起来也很简单，只需要把计算`average`的代码换一下：

```JavaScript
var average = data[i + 0] * 0.3 + data[i + 1] * 0.6 + data[i + 2] * 0.1;
```

效果：
![加权后的黑白效果](4.jpeg)

## 变亮与变暗 ##

变量就是每个像素的颜色加上一个值，直接上代码：

```JavaScript
var image = new Image();
image.src = "lufei.jpeg";
image.onload = function (){
  context.drawImage(image, 0, 0,image.width / 2, image.height / 2);
  var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;
  for (var i = 0; i < data.length; i+=4) {
    var brightness = 50;
    data[i + 0] += brightness;
    data[i + 1] += brightness;
    data[i + 2] += brightness;
  }
  context.putImageData(imageData, 0, 0);
}
```

[此时的效果如下](https://canvas-demo.kai666666.top/08/03.html)：

![变亮](5.jpeg)

你猜猜变暗是怎么处理的？没错就是减去一个值，你挺聪明的！！！直接修改`var brightness = -50;`，效果如下：

![变暗](6.jpeg)

## 复古效果 ##

复古效果算法比较复杂，需要每一个颜色做加权处理，其算法是别人研究好久得出的，我们都是站在巨人的肩膀上：

```JavaScript
var image = new Image();
image.src = "lufei.jpeg";
image.onload = function (){
  context.drawImage(image, 0, 0,image.width / 2, image.height / 2);
  var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;
  for (var i = 0; i < data.length; i+=4) {
    data[i + 0] = 0.39 * data[i + 0] + 0.76 * data[i + 1] + 0.18 * data[i + 2];
    data[i + 1] = 0.35 * data[i + 0] + 0.68 * data[i + 1] + 0.16 * data[i + 2];;
    data[i + 2] = 0.27 * data[i + 0] + 0.53 * data[i + 1] + 0.13 * data[i + 2];;
  }
  context.putImageData(imageData, 0, 0);
}
```

[效果如下](https://canvas-demo.kai666666.top/08/04.html)：

![复古效果](7.jpeg)

## 蒙层 ##

蒙层就是某一个色道取平均值，另外2个色道为0就可以了，以红色蒙层为例：

```JavaScript
var image = new Image();
image.src = "lufei.jpeg";
image.onload = function (){
  context.drawImage(image, 0, 0,image.width / 2, image.height / 2);
  var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;
  for (var i = 0; i < data.length; i+=4) {
    var average = ( data[i + 0] + data[i + 1] + data[i + 2] ) / 3;
    data[i + 0] = average;
    data[i + 1] = 0;
    data[i + 2] = 0;
  }
  context.putImageData(imageData, 0, 0);
}
```

[效果如下](https://canvas-demo.kai666666.top/08/05.html)：

![红色蒙层](8.jpeg)

绿色蒙层和蓝色蒙层我相信你也会了，这里就不再给代码了。

## 透明效果 ##

我们说了这么多，都是以色道为例的，从来没有涉及到透明度，现在就给一个透明度的例子：

```JavaScript
 var image = new Image();
image.src = "lufei.jpeg";
image.onload = function (){
  context.drawImage(image, 0, 0,image.width / 2, image.height / 2);
  var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;
  for (var i = 0; i < data.length; i+=4) {
    data[i + 3] = 0.5 * data[i + 3];
  }
  context.putImageData(imageData, 0, 0);
}
```

[效果如下](https://canvas-demo.kai666666.top/08/06.html)：

![透明效果](9.jpeg)

我们这里给的透明度细数是0.5，所以透明度变为原来的50%，你也可以修改为自己喜欢的数值。

## 创建ImageData ##

上面我们一直在玩`getImageData`和`putImageData`，至于`createImageData`都没有说过，其实这个用的也并不多，这里给一个例子结束本章吧：
```JavaScript
var imageData = context.createImageData(100, 100);
var data = imageData.data;
for (var i = 0; i < data.length; i+=4) {
  data[i + 0] = 255;
  // 下面这行很重要，默认创建后rgba的值都是0，所以也就是透明的
  data[i + 3] = 255;
}
context.putImageData(imageData, 10, 10);
```

效果如下，是不是又学会了一种画正方形的方法了？

![createImageData](10.jpeg)
