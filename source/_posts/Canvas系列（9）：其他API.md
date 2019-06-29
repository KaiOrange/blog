---
title: Canvas系列（9）：其他API
date: 2019-06-29 13:03:31
author: Orange
tag:
	- Canvas
categories: Canvas
---

前面的内容讲了不少Canva的API，这章把剩下的API一讲吧。这个系列中以后基本不糊涉及新的API了，因为，这章完了我们就真的学完了！

----

## 阴影 ##

Canvas中的阴影和CSS3中的阴影很像，通过本系列课程的学习，估计你已经发现了，CSS3的好多知识和Canvas是相通的。我们直接看一个例子：

```JavaScript
// 阴影X偏移量 默认0
context.shadowOffsetX=5;
// 阴影Y偏移量 默认0
context.shadowOffsetY=5;
// 阴影颜色 默认透明
context.shadowColor='orange';
// 阴影模糊值 默认0
context.shadowBlur=5;
context.fillRect(10,10,50,50);

// 阴影不模糊
context.shadowBlur=0;
context.fillRect(80,10,50,50);

context.shadowBlur=5;
// 使用在描边上
context.strokeRect(150, 10, 50, 50);

context.font='bold 30px 微软雅黑';
context.shadowBlur=3;
// 使用在文字上
context.fillText("文字模糊", 10, 100);
```

结果如下：

![模糊](1.jpeg)

由我们可以看到，阴影其实就是当前区域往左边偏移了一点，再往右边偏移了一点，然后给个颜色，给个模糊就可以了。当然偏移量可以是负值，表示方向，这个就不说了。同样由上我们可以知道阴影可以用在图形上也可以用在文字上，那么可以用在图片上吗？其实是不可以的，但是有方法可以，就是具有阴影地描边一个与图片大小位置全相同的矩形就可以了。

## globalAlpha ##

`globalAlpha`是设置全局的透明度，取值范围是`0~1`，0表示透明，1表示不透明。我们之前没有设置所绘制的图形的透明度，但是都是不透明的，所以猜都能猜出来默认值是1。它的值可以是字符串类型，也可以数值类型，我们直接在上面代码中第十行中加入代码`context.globalAlpha=0.5;`看到的效果如下：

![globalAlpha](2.jpeg)

可以看到`globalAlpha`对它和它后面所绘制的图形是生效的，那么如何绘制完后恢复状态呢，还记得前面的内容吗？

## globalCompositeOperation ##

`globalCompositeOperation`描述了2个图形交叉的时候是什么样子，它的值有很多，这里就盗一张很经典的图：

![globalCompositeOperation取值](3.jpeg)

我们这里就给一个值为`xor（异或）`的例子吧：

```JavaScript
context.globalCompositeOperation='xor';

context.fillStyle='orange';
context.fillRect(10,10,50,50);

context.fillStyle='blue';
context.fillRect(35,35,50,50);
```

结果如下：

![xor](4.jpeg)

## clearRect ##

在[路径与状态那一章](/2019/06/16/Canvas系列（3）：路径与状态/#more)我们使用clip来裁剪区域，与裁剪相似的还有一个clearRect用来清空区域，如下：

```JavaScript
context.fillStyle='orange';
context.fillRect(10,10,50,50);

context.fillStyle='blue';
context.fillRect(35,35,50,50);

// 清空一个小区域
context.clearRect(60, 60, 25, 25);
```

结果如下：

![清空区域](5.jpeg)

`clearRect`用的挺多的，通常做动画的时候使用它来清空整个屏幕，然后再重新绘制图案：

```JavaScript
// 清空整个canvas
context.clearRect(0, 0, canvas.width, canvas.height);
```

## toDataURL ##

与上面不同的是`toDataURL`并不是context上的方法，而是canvas对象的方法，来看个例子：

```JavaScript
context.fillStyle='orange';
context.fillRect(10,10,50,50);

context.fillStyle='blue';
context.fillRect(35,35,50,50);

var src = canvas.toDataURL("image/png");
var image = new Image();
image.src = src;
document.body.appendChild(image)
```

结果如下：

![toDataURL](6.jpeg)

`canvas.toDataURL`会转换为Base64格式的字符串，然后图片可以直接使用它，以显示出来。上面我们可以看到背景是不一样的，因为左侧的背景是我们通过CSS来设置的，而不是Canvas来绘制出来的。

----

至此，我们学完了Canvas几乎全部的API，恭喜你啊。此时，你又什么感想呢？是成就满满？还是感觉并没有学到些什么？如果你感觉成就满满，说明你是真的是学到了东西，如果还感觉没学到什么，也不要灰心，因为Canvas的学习并不仅仅是API，更多的是编程的一些技巧。好多时候我们学习编程其实学的只是一些语法和API而更多的经验还需要不断地在实践中去历练，往往一些编程技巧比语法和API要更重要，现在你学习的是HTML5中的Canvas，其实安卓、Java中的Swing、C++中的MFC（都是老技术了，新技术真心快学不懂了）等等绘制图片的技能都相差无几。我们后面的课程就会深入这些技能。
