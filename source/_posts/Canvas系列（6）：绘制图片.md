---
title: Canvas系列（6）：绘制图片
date: 2019-06-19 15:04:46
author: Orange
tag:
	- Canvas
categories: Canvas
---

我们现在已经可以绘制好多东西了，不过在实际开发中，绘制最多的当然是图片了，这章我们就讲讲图片的绘制。

----

## 绘制图片 ##

绘制图片的API是`drawImage`，它的参数有三种情况：

```JavaScript
// 将图片绘制在canvas的(dX, dY)坐标处
context.drawImage(Image, dX, dY);
// 将图片绘制在canvas的(dX, dY)坐标处 图片大小缩放至dWidth * dHeight
context.drawImage(Image, dX, dY, dWidth, dHeight);
// 原图片将会按照 左上角坐标为(sX, sY) 大小为sWidth * sHeight裁剪
// 然后再将图片绘制在canvas的(dX, dY)坐标处 图片大小缩放至dWidth * dHeight
// 注意参数的位置！！
context.drawImage(Image, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);
```

来一个例子：

```JavaScript
var image = new Image();
image.src = "https://www.kai666666.com/2019/06/19/Canvas系列（6）：绘制图片/lufei.jpeg";
image.onload = function (){
  context.drawImage(image, 10, 10);
}
```

[可以看到如下效果](https://canvas-demo.kai666666.com/06/01.html)：

![绘制图片](1.jpeg)

由上面可知，图片必须加载完成以后才可以绘制，所以我们放在`onload`里面了，当然也可以使用`img标签`，如果我们的代码是在图片加载完后加载的就不会有什么问题。现在我们修改一下绘制的参数，如下：

```JavaScript
context.drawImage(image, 10, 10, 100, 100);
```

[出来的效果是这样的](https://canvas-demo.kai666666.com/06/02.html)：

![绘制图片5个参数](2.jpeg)

我们试一下参数最多的这个，如下：

```JavaScript
context.drawImage(image, 0, 0, 120, 120, 10, 10, 100, 100);
```

[出来的效果是这样的](https://canvas-demo.kai666666.com/06/03.html)：

![绘制图片9个参数](3.jpeg)

当然`drawImage`除了可以绘制图片以外，还可以绘制canvas：

```JavaScript
var canvas2 = document.createElement("canvas")
var context2 = canvas2.getContext("2d");
context2.fillRect(10,10,30,30);
// 这里绘制的是canvas元素
context.drawImage(canvas2, 0, 0);
```

[出来的效果是这样的](https://canvas-demo.kai666666.com/06/04.html)：

![绘制canvas](4.jpeg)

当然除了可以绘制canvas以外还可以绘制video不过每次只能绘制一屏，如果希望绘制的图形也可以播放的话，那么就要循环多次调用绘图了。同样的如果图片是GIF的也不会动态播放出来，而是会显示第一张。这两种情况很少用到，就不在重复了。

> 双缓冲技术：使用老的技术来绘图可能会有闪屏的现象，这往往是每绘制一屏的时候，然后用一个空白的屏幕来清理全屏，这就导致屏幕有的时候会一闪一闪的。解决这个问题的办法就是双缓冲技术。双缓冲技术说的是把画布先画在一个离线的canvas（或者图片）上，然后再把这个canvas绘制到用户看到的canvas上，因为每次看到的都是新canvas的覆盖，并不需要渲染空白屏，所以就不会有闪屏现象了，H5中的canvas是默认拥有双缓冲的，所以我们不需要再处理了。双缓冲技术更多的信息可以看[这篇](https://blog.csdn.net/jxw167/article/details/72157154)。


## 线性渐变 ##


我们之前使用过一个属性叫`fillStyle`，我们可以看到几乎我们都给的是某个颜色，那么为什么不直接叫`fillColor`呢，因为他除了颜色还可以设置其他的值，就比如线性渐变。定义一个线性渐变，大致是这个样子：

```JavaScript
// 创建一个线性渐变对象 （x1, y1）是起始坐标 （x2, y2）是结束坐标
var gradient = context.createLinearGradient(x1, y1, x2, y2);
// 在0~1的范围内 添加颜色 0是开始位置 1是结束位置
gradient.addColorStop(number, 'color1');
gradient.addColorStop(number, 'color2');
// 设置线性渐变
context.fillStyle = gradient;
```

现在来看一个例子

```JavaScript
var gradient = context.createLinearGradient(0,0,300,150);
gradient.addColorStop(0,"black");
gradient.addColorStop(0.5,"white");
gradient.addColorStop(1,"red");
context.fillStyle = gradient;
context.fillRect(10,10,280,130);
```

[出来的效果是这样的](https://canvas-demo.kai666666.com/06/05.html)：

![线性渐变](5.jpeg)

## 径向渐变 ##

径向渐变和线性渐变很像，用法如下：

```JavaScript
// 创建一个径向渐变变对象 （x1, y1）是其实坐标 r1是起始半径 （x2, y2）是结束坐标 r2是结束半径
var gradient = context.createRadialGradient(x1, y1, r1, x2, y2, r2);
// 在0~1的范围内 添加颜色 0是开始位置 1是结束位置 和线性渐变是一样的
gradient.addColorStop(number, 'color1');
gradient.addColorStop(number, 'color2');
// 设置径向渐变
context.fillStyle = gradient;
```

现在来看一个例子

```JavaScript
var gradient =  context.createRadialGradient(150, 75, 10, 150, 75, 100);
gradient.addColorStop(0,"black");
gradient.addColorStop(0.5,"white");
gradient.addColorStop(1,"red");
context.fillStyle = gradient;
context.fillRect(10,10,280,130);
```

[出来的效果是这样的](https://canvas-demo.kai666666.com/06/06.html)：

![径向渐变](6.jpeg)

由上我们可以看出，**渐变开始往前会使用渐变的第一个颜色，渐变结束往后会使用渐变的最后一个颜色**。

## 图片背景 ##

style不仅仅可以是颜色和渐变，当然也可以是图片了，语法大概是这个样子的：

```JavaScript
// 创建图片背景 Image就是一个图像 repetition是重复的关键字
// repetition可选值有："repeat|repeat-x|repeat-y|no-repeat" 意思非常明显
var pattern = context.createPattern(Image, repetition);
// 设置图片背景
context.fillStyle = pattern;
```

我们现在做一个文字带有背景的例子，[效果如下](https://canvas-demo.kai666666.com/06/07.html)：：

![绘制canvas](7.jpeg)

具体代码：

```JavaScript
var image = new Image();
image.src = "https://www.kai666666.com/2019/06/19/Canvas系列（6）：绘制图片/lufei.jpeg";
image.onload = function (){
  var pattern = context.createPattern(image, "repeat");
  context.font='30px 微软雅黑';
  context.fillStyle = pattern;
  context.fillText("带有炫酷背景的文字", 10, 85);
}
```
