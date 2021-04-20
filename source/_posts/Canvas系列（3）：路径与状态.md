---
title: Canvas系列（3）：路径与状态
date: 2019-06-16 14:03:20
author: Orange
tag:
	- Canvas
categories: Canvas
---

前两章我们学的是基本图形的描边和填充，学完基本图形绘制以后就会绕不过2个概念就是路径和状态，本章我们看看这一块的内容。

----

## beginPath ##

beginPath表示开始一个路径，我们在上一章画弧的时候用到过好多次，他的API非常简单：

```JavaScript
context.beginPath();
```

开始路径有2层意思，一个就是本次绘制的起点是新的（不再是上次结束的点了），另外一个意思就是绘制的样式也是新的（不再与之前的样式有关联）。对于第一条上一个章节我们已经见识过了，如果不开始一个新的路径那么描边弧线的时候就会有一条上次绘制结束到弧线开始时的连线（当然moveTo可以避免，但需要计算，不方便）。
现在考虑这么一个需求，我们需要画3条线，线的颜色分别是红绿蓝，使用之前的知识，你应该可以的，你先试一下？或许你写的代码是这样的：

```JavaScript
context.moveTo(10, 50);
context.lineTo(290, 50);
context.strokeStyle='#FF0000';
context.stroke();

context.moveTo(10, 75);
context.lineTo(290, 75);
context.strokeStyle='#00FF00';
context.stroke();

context.moveTo(10, 100);
context.lineTo(290, 100);
context.strokeStyle='#0000FF';
context.stroke();
```

[执行后的结果大概是这个样子的](https://canvas-demo.kai666666.com/03/01.html)：

![颜色出现错误](1.jpeg)

我们发现颜色是错误的，但是又不清楚哪里有问题了。难道是它的API有bug了吗?我们打断点，然后单步执行，看看上面三个stroke依次执行后的效果：

![红色执行后](2.jpeg)
![绿色执行后](3.jpeg)
![蓝色执行后](4.jpeg)

我们可以看到，当代码执行到红色以后是对的（虽然把坐标系也变成红色了）；然后绿色执行后把绿色这条渲染对了，但是又用绿色渲染了一下红色的那条线，使得红色的线变成2者的叠加色了；当绿色的执行完了以后，把最后一条线描边成绿色，但是又把前面的也渲染了一遍，所以最终的颜色就是我们之前看到的。要让新的线不在绘制之前的就用`beginPath`来开启一个新的路径。看看我们使用后的效果：

```JavaScript
context.beginPath();
context.moveTo(10, 50);
context.lineTo(290, 50);
context.strokeStyle='#FF0000';
context.stroke();

context.beginPath();
context.moveTo(10, 75);
context.lineTo(290, 75);
context.strokeStyle='#00FF00';
context.stroke();

context.beginPath();
context.moveTo(10, 100);
context.lineTo(290, 100);
context.strokeStyle='#0000FF';
context.stroke();
```


[效果](https://canvas-demo.kai666666.com/03/02.html)：

![正常渲染](5.jpeg)

总结一下：**使用beginPath路径将不再与之前的联系，绘制时也不再绘制之前的（所以已绘制图案的样式不再叠加）。**

## closePath ##

closePath是闭合路径，注意是闭合路径而不是结束路径，虽然目前的位置是在beginPath后面，但是两者没什么关系，它并不是endPath（没有这个）。

现在有需求，需要描边一个45°的扇形，你以你现在的技术完全可以胜任，大笔一挥：

```JavaScript
context.beginPath();
context.moveTo(150, 75);
context.arc(150, 75, 80, Math.PI / 180 * 0, Math.PI / 180 * 45);
context.lineTo(150, 75);
context.stroke();
```

[此时效果如下](https://canvas-demo.kai666666.com/03/03.html)：

![描边扇形](6.jpeg)

效果不错，挺满意的。现在我们观察倒数第二行代码，我们使用`context.lineTo(150, 75);`画了一条回到圆心（起点）的线。在`stroke`的时候回到起点可以绘制出一个闭合的图形，这种操作实在太多了，为了简化这个步骤，我们就可以使用`closePath`。现在直接把`context.lineTo(150, 75);`替换为`context.closePath();`你会发现效果是一样的，这样就省去了自己计算起点位置的步骤了。我强烈建议在闭合路径的时候使用`closePath`。
需要顺便提醒一下，填充（fill）的时候，对于一个终点和起点没有闭合的路径，默认会闭合了再去填充（不然没得玩了），如下。当然如果还有其他没有闭合的时候（就比如平行的2个线段），那么就真的没的完了，他也“不会”绘制了。

```JavaScript
context.beginPath();
context.moveTo(150, 75);
context.arc(150, 75, 80, Math.PI / 180 * 0, Math.PI / 180 * 45);
context.fill();
```

上面没有闭合，直接填充，结果和闭合了以后是[一样的效果](https://canvas-demo.kai666666.com/03/04.html)：

![填充扇形](7.jpeg)

## 点是否在路径内部 ##

跟路径有关的一个常见问题，就是需要判断点是否在一个路径的内部。canvas考虑到大家的这个需要，给了大家提供了这样的API：

```JavaScript
// 坐标(x, y)是否在路径内部 如果在就返回true否则就返回false
context.isPointInPath(x, y);
```

这里需要注意的有三点：

1. 如果一个路径结束和开始的位置没有闭合，判断的时候会按照闭合来处理（如果结束点和开始点闭合后整个路径还没有闭合，那么就返回false）。
2. `strokeRect`和`fillRect`不会保留绘制的矩形路径，所以`isPointInPath`不能对他们进行判断，可以使用`rect`代替。
3. 如果刚刚在路径所处的直线上，那么需要根据线宽来决定，如果路径内与线中心一侧的时候那么返回false，其他的时候返回true，举个例子比如线宽是1，那么如果在线上，说明是内部；如果线宽是3，那么在内部和前2个像素上是内部，外面的一个像素是外部。

看了第三条你可能又会问那么就只想知道是否在线上怎么办，那就可能会用到另一个API了：

```JavaScript
// 坐标(x, y)是否在描边上 如果在就返回true否则就返回false
context.isPointInStroke(x, y);
```

此时你可能还会问，你只想知道是否在路径的内部，根本不关心在不在描边上，那么怎么办？给你提醒一下，把这两个API综合起来判断就可以了，相信你一定可以做到的。此外这两个API比较简单就不再给出例子了，感兴趣的同学可以自己研究下。

## 裁剪区域 ##

路径学完了我们先额外插播一个小知识，就是裁剪区域，先看个例子，我们先描边一个圆形，再填充一个矩形：

```JavaScript
context.beginPath();
context.arc(150, 75, 40, Math.PI / 180 * 0, Math.PI / 180 * 360);
context.stroke();

// 开始新的路径 与之前的不再有关系 如果不开始 下面的fill的时候会把上面圆也fill了
context.beginPath();
context.rect(150, 75, 40, 40);
context.fill();
```

[此时结果如下](https://canvas-demo.kai666666.com/03/05.html)：

![描边圆，填充矩形](8.jpeg)

然后我们按照圆的样子裁剪矩形，稍微修改一下代码：

```JavaScript
context.beginPath();
context.arc(150, 75, 40, Math.PI / 180 * 0, Math.PI / 180 * 360);
context.stroke();

// 按照圆裁剪
context.clip();

context.beginPath();
context.rect(150, 75, 40, 40);
context.fill();
```

[此时结果如下，简直完美](https://canvas-demo.kai666666.com/03/06.html)：

![按照圆裁剪矩形](9.jpeg)

这里需要注意的是**裁剪也是基于路径来的，所以`strokeRect`和`fillRect`是不生效的。**
我们再画一个矩形：

```JavaScript
context.beginPath();
context.arc(150, 75, 40, Math.PI / 180 * 0, Math.PI / 180 * 360);
context.stroke();

// 按照圆裁剪
context.clip();

context.beginPath();
context.rect(150, 75, 40, 40);
context.fill();

// 再画一个矩形
context.beginPath();
context.rect(190, 35, 80, 80);
context.fill();
```

[结果](https://canvas-demo.kai666666.com/03/07.html)：

![再画一个矩形](10.jpeg)

什么放错图了？没错，就是这个样子！我们分析一下，上面画了一个圆，然后描边了，然后按照圆裁剪，那么下面画的第一个矩形会按照圆来裁剪，没问题。然后画了第二个矩形，那么问题来了，这个矩形也被裁剪了！那么怎么让第二个矩形不再裁剪呢？如果后面的一直都被裁剪，那么每裁剪一次就缩小一点点距离，那多痛苦。

## 状态的保存于恢复 ##

接下来就是我们的处理办法了，如果裁剪前把当前状态保存了，然后裁剪完第一个矩形后，再把状态恢复了，不是很好的解决了这个问题吗？canvas也是这么做的：

```JavaScript
context.beginPath();
context.arc(150, 75, 40, Math.PI / 180 * 0, Math.PI / 180 * 360);
context.stroke();

// 保存状态
context.save();

context.clip();

context.beginPath();
context.rect(150, 75, 40, 40);
context.fill();

// 恢复之前保存的状态，即没有裁剪时那个状态
context.restore();

context.beginPath();
context.rect(190, 35, 80, 80);
context.fill();
```

[一个刷新，完美](https://canvas-demo.kai666666.com/03/08.html)：

![恢复状态](11.jpeg)

通常裁剪前一般都会保存路径的，裁剪完后，一般都会恢复的。除此之外保存与恢复也可以用在某些样式状态上，还可以用在形变（后面会讲到的，类似与CSS3的transform）的状态保存上。
