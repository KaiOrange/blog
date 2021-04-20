---
title: Canvas系列（4）：线条操作
date: 2019-06-16 16:49:54
author: Orange
tag:
	- Canvas
categories: Canvas
---

通过前三章的学习，你几乎可以绘制出任何图形了，但是却不会画一条虚线，也是够惨的。今天的内容很简单，只简绍3个属性和1个方法，准备好了吗？

----

## 线条的粗线 ##

`lineWidth`是改变线条的粗线的，默认是一个像素：

```JavaScript
context.beginPath();
context.moveTo(20, 50);
context.lineTo(280, 50);
context.lineWidth=1;
context.stroke();

// 如果这里没有beginPath 你猜猜这三条线的宽度分别是多少
context.beginPath();
context.moveTo(20, 75);
context.lineTo(280, 75);
context.lineWidth=5;
context.stroke();

context.beginPath();
context.moveTo(20, 100);
context.lineTo(280, 100);
context.lineWidth=10;
context.stroke();
```

[结果如下](https://canvas-demo.kai666666.com/04/01.html)：

![改变线宽](1.jpeg)

如果上面没有`beginPath`那么后面线描边的时候也会把之前的绘制一下，那么三条先最终的宽度就都是10了。
`lineWidth`也可用于矩形和圆弧上，只要画线的地方都可以，如下：

```JavaScript
context.beginPath();
context.rect(20, 20, 60, 60);
context.lineWidth=20;
context.stroke();
```

[结果如下](https://canvas-demo.kai666666.com/04/02.html)：

![矩形描边](2.jpeg)

我们可以看到改变`lineWidth`，矩形的大小也变了，目前的宽度是`矩形的宽度 + lineWidth`（左边多了一半，右边也多了一半）。

## 线帽样式 ##

线帽样式由lineCap来定义，它有三个值`butt | round | square`分别对应`无线帽 | 圆角 | 方形`，默认是`butt`（无线帽），如下：

```JavaScript
context.beginPath();
context.moveTo(20, 50);
context.lineTo(280, 50);
context.lineWidth=10;
context.lineCap='butt';// 无线帽 默认值
context.stroke();

context.beginPath();
context.moveTo(20, 75);
context.lineTo(280, 75);
context.lineWidth=10;
context.lineCap='round'; // 圆角
context.stroke();

context.beginPath();
context.moveTo(20, 100);
context.lineTo(280, 100);
context.lineWidth=10;
context.lineCap='square'; // 方形
context.stroke();
```

[结果如下](https://canvas-demo.kai666666.com/04/03.html)：

![线帽样式](3.jpeg)

线帽样式对于越宽的线条效果越明显，所以上面线宽给了一个10。同时可以看到线帽给的不一样，宽度其实也是有点不同的。
线帽只是对线条2端点的样式做了处理，如果是线条中间的那么就不生效了：

```JavaScript
    context.beginPath();
    context.moveTo(100, 50);
    context.lineTo(200, 50);
    context.lineTo(200, 100);
    context.lineWidth=20;
    context.lineCap='round';
    context.stroke();
```

[结果如下](https://canvas-demo.kai666666.com/04/04.html)：

![中间不生效](4.jpeg)

如果要改变中间的样子那该怎么办？那么就是用`lineJoin`。

## 线条交界处样式 ##

线条交界处样式由`lineJoin`来决定，它有三个值`miter | bevel | round`分别是`尖角 | 斜角 | 圆角`，默认是`miter`。斜角时如下：

```JavaScript
context.beginPath();
context.moveTo(100, 50);
context.lineTo(200, 50);
context.lineTo(200, 100);
context.lineWidth=20;
context.lineCap='round';
context.lineJoin='bevel';
context.stroke();
```

[结果如下](https://canvas-demo.kai666666.com/04/05.html)：

![斜角](5.jpeg)

如果`context.lineJoin='bevel';`改为`context.lineJoin='round';`时，结果如下：

![圆角](6.jpeg)

## 绘制虚线 ##
虚线是由细小的实线和空白组成，绘制虚线使用`setLineDash`方法，它接收一个数组作为参数，数组是实线和空白的长度：

```JavaScript
context.beginPath();
context.arc(150, 75, 60, Math.PI / 180 * 0, Math.PI / 180 * 360);
// 实线和空白比例是10px : 5px
context.setLineDash([10,5]);
context.stroke();
```

[结果如下](https://canvas-demo.kai666666.com/04/06.html)：

![改变线宽](7.jpeg)

值的一提的是，如果不传数组的话，那么就会报错；传一个空数组的话，会按照实线去绘制；如果数组只有一个元素的话，那么就是实线和空白依次按这个元素大小来绘制；如果多个元素的时候就是交替循环来间隔。
