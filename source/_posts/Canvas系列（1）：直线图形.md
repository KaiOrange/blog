---
title: 'Canvas系列（1）：直线图形'
date: 2019-06-15 12:04:20
author: Orange
tag:
	- Canvas
categories: Canvas
---

在前端最令人兴奋的技术莫过于Canvas技术。它可以制作出更加绚丽的效果，甚至完全可以胜任游戏开发。最近我也在学习Canvas相关的技术，总是想拿出来跟大家一起分享分享，由于这块技术比较庞大，所以我就分章节一章一章地跟大家分享。这几章节中我们并不涉及webGL相关的知识，感兴趣的可以自己玩一玩。

我们的全部代码可以在这个网址查看：[https://github.com/KaiOrange/canvas-demo](https://github.com/KaiOrange/canvas-demo)。

----

## 快速上手 ##

在HTML5中，涌现了很多的新技术，其中最令人兴奋的就是Canvas。我就不卖关子了，直接快速使用吧。首先我们有这样的HTML代码：

```HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Canvas系列</title>
  <style type="text/css" >
    #canvas{
      background: #f5f5f5;
    }
  </style>
</head>
<body>

  <canvas id="canvas"></canvas>

  <script type="text/javascript">

  </script>
</body>
</html>
```

这个是我们的模板，如果你想好好学习的话，建议你也创建一个`index.html`文件，并且把代码敲一下。此时我们看到的效果是这个样子的：

![初始canvas效果](1.jpeg)

canvas标签默认的样式是大小为`300 * 150`像素、`没有背景色`的行内替换元素，类似于img标签。我们这里为了看上去更加方便给了一个背景元素。
要使用canvas进行绘图，需要使用JavaScript去控制它，现在我们就在script标签中添加JavaScript代码来绘制一条直线：

```JavaScript
// 1. 获取canvas元素
var canvas = document.getElementById("canvas");
// 2. 获取上下文对象
var context = canvas.getContext('2d');
// 3. 绘制图片
context.moveTo(10, 75);
context.lineTo(290, 75);
context.stroke();
```

出来的效果如下：

![绘制一条线](2.jpeg)

通过上面几行代码我们知道canvas绘图的时候无非就是三个步骤：

1. 获取canvas元素
2. 获取上下文对象
3. 绘制图片

第一步获取canvas元素其实就是DOM操作，获取到的canvas元素也是DOM元素，DOM元素就有大量的DOM相关的属性和方法了，可以使用`console.table(canvas);`打印一下。canvas中最重要的属性和方法莫过于这四个：

属性或方法|含义
---|---
width|长度
height|宽度
getContext('2d')|获取2D上下文，如果是WebGL可以传webgl
toDataURL()|获取转换的位图字符串（后面会简绍）

第二步中传递的是`2d`，这样会返回一个绘制2D图形的上下文，也就是`context`对象。因为canvas是画布的意思，有人也把上下文对象成为画笔。如果要绘制3D图像怎么办？可以传一个`webgl`来获取WebGL的上下文，这样就可以绘制3D效果了（WebGL是基于OpenGL，是已存在的一套技术，所以并没有使用3D来获取3D的上下文，有可能以后开发出性能更加优越的3D绘制系统的话可能会取代WebGL，当然短期内是不会的，毕竟WebGL加上部分库用起来也很方便，性能也挺不错的）。

最重要的第三步，canvas提供了大量的API供我们绘制图片，我们下面几个章节会重点简绍。

最后需要注意2点：

1. 计算机中除了WebGL等少数坐标系的y轴是向上的，其他的都是向下的，我们的2d上下文的y轴就是向下的。
2. 设置canvas大小的时候使用HTML中的属性设置，而不要使用CSS设置，如果使用CSS设置后会缩放。

对于第二条特别重要，我们试着修改CSS：

```CSS
#canvas{
  background: #f5f5f5;
  width: 150px;
  height: 300px;
}
```

现在的效果是：

![CSS控制宽度](3.jpeg)

可以看到线段仍然是居中的，而且明显粗了，这是缩放导致的。
使用HTML控制如下：

```HTML
<canvas id="canvas" width="150" height="300"></canvas>
```

![HTML控制宽度](4.jpeg)

## 绘制2条线段 ##

绘制线段用到2个API：

```JavaScript
// 将画笔移动到(x1, y1)的坐标
context.moveTo(x1, y1);
// 画线到(x2, y2)的坐标
context.lineTo(x2, y2);
```

通过上述2步以后其实并没有画线，通过上面可以看到还需要调用`context.stroke();`，这一点一定要记住。为什么要多此一步呢？一方面是因为一次性统一绘制会减少内存的开销，另一个原因是因为canvas不仅仅支持描边（stroke）还支持填充（fill），后面马上就会遇到了。

那如果画2条线呢？我们就重复使用上面两个API，如下：

```JavaScript
context.moveTo(10, 65);
context.lineTo(290, 65);
context.moveTo(10, 85);
context.lineTo(290, 85);
context.strokeStyle='blue';
context.stroke();
```

效果：
![绘制2条线](5.jpeg)

你可能已经看到了我们这里使用了`context.strokeStyle='blue';`把线段的颜色改成蓝色（而不是默认的黑色），这个属性一定要在stroke之前调用，否则都描边结束了才设置，是不会生效的，这样改变的是下面描边的颜色，就好比你拿黑色的笔画了一条线，结果你又拿起了一只蓝色的笔，然后你希望你刚刚话的线是蓝色的。
这里的`strokeStyle`是描边的样式，它的值可以是特殊颜色值如`blue`等，也可以是`rab(0,0,255)`,还可以是`raba(0,0,255,1)`,更可以是`#0000FF`，甚至是图片、渐变等（后面会讲到，所以没有叫`strokeColor`）。

## 描边矩形 ##

矩形就是4条线段，我们直接开画：

```JavaScript
context.moveTo(90, 15);
context.lineTo(210, 15);
context.lineTo(210, 135);
context.lineTo(90, 135);
context.lineTo(90, 15);
context.stroke();
```

效果：
![描边矩形](6.jpeg)

我们绘制了一个宽高都为120px的矩形（其实也就是一个正方形）。由上可知`lineTo`划线的起点是**上一次移动到的地方或者上次划线结束的地方**，因此我们没有必要每次都`moveTo`当前位置。
由于矩形是非常重要的图形，所以canvas提供了一个更加方便的API：

```JavaScript
// 绘制一个起始坐标为:(x, y) 宽度:width 高度:height 的矩形
context.rect(x, y, width, height);
```

使用新的API绘制：

```JavaScript
context.rect(90, 15, 120, 120);
context.stroke();
```

这下是不是容易多了？什么？还不容易，那么给你简绍一个更简单的API：

```JavaScript
// 绘制一个起始坐标为:(x, y) 宽度:width 高度:height 的矩形
// 使用strokeRect将会直接绘制出来 而不需要在调用stroke()了
context.strokeRect(x, y, width, height);
```

使用新的API绘制：

```JavaScript
context.strokeRect(90, 15, 120, 120);
```

## 填充矩形 ##

填充和描边一样，只是描边的时候调用的是stroke，填充的时候是fill，看一个例子：

```JavaScript
context.moveTo(90, 15);
context.lineTo(210, 15);
context.lineTo(210, 135);
context.lineTo(90, 135);
context.lineTo(90, 15);
context.fillStyle='blue';
context.fill();
```

效果：
![描边矩形](7.jpeg)

是不是很简单，你可能已经注意到了修改填充矩形的样式是`fillStyle`，其用法跟描边时是一样的。
此时你会有一个疑问，那么描边矩形有简写吗？如果你问的话，说明你的学习力还是很不错的，先给你一个赞。当然有了，直接上代码：

```JavaScript
// 简写1
context.rect(90, 15, 120, 120);
context.fillStyle='blue';
context.fill();

// 简写2
context.fillStyle='blue';
context.fillRect(90, 15, 120, 120);
```

如果既要描边又要填充怎么办呢？可以看这个：

```JavaScript
context.rect(90, 15, 120, 120);
context.strokeStyle='red';
context.stroke();
context.fillStyle='rgba(0,0,255,0.5)';
context.fill();
```

效果如下，像不像CSS给了一个背景和一个边框？没错填充就类似于是设置背景，描边就类似于给个边框。

![描边和填充](8.jpeg)

## 绘制简易坐标系 ##

为了更方便后面你的使用我们绘制一个简易的坐标系吧，效果如下：

![简易坐标系](9.jpeg)

完整HTML代码如下，后面的如果不出意外的话就会在这个基础上绘制：

```HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Canvas系列</title>
  <style type="text/css" >
    #canvas{
      background: #f5f5f5;
    }
  </style>
</head>
<body>

  <canvas id="canvas" ></canvas>

  <script type="text/javascript">
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext('2d');
    var sW = 1;
    var lW = 4;
    var spacing = 10;
    for (var x = 0; x < canvas.width; x+=spacing) {
      context.moveTo(x, 0);
      if(x % (spacing * 5) === 0){
        context.lineTo(x, lW);
      } else {
        context.lineTo(x, sW);
      }
    }
    for (let y = 0; y < canvas.height; y+=spacing) {
      context.moveTo(0, y);
      if(y % (spacing * 5) === 0){
        context.lineTo(lW, y);
      } else {
        context.lineTo(sW, y);
      }
    }
    context.stroke();

    // 其他代码

  </script>
</body>
</html>
```
