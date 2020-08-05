---
title: Canvas系列（12）：动画高级
date: 2019-06-30 16:03:54
tag:
	- Canvas
categories: Canvas
---

通过前面章节的学习，我们已经学会了直线和部分曲线运动，同时我们也学会了加速、减速、摩擦力等操作。那么动画还有什么需要深入研究下去的呢？当然有，那就是让动画更加平滑，更细滑。

----

## 缓动动画 ##

在使用CSS3做变化的时候我们经常使用`transition-timing-function`，其中最有名的两个值就是`ease-in`和`ease-out`，那canvas种怎么实现这中如丝般细滑的缓动动画呢？看完本章你就知道了。缓动的公式如下：

>当前速度 = (最终位置 - 当前位置) \* 缓动系数。
>新的位置 = 当前位置 + 当前速度。

我们看一个简单的例子

```JavaScript
//...

// 设置x的值放在最左边
var ballX = ballRadius;
var ballY = centerY;
// x的速度 具体是多少在update的时候计算
var vx;
// 缓动系数
var easing = 0.03;
// 最终位置 在最右边
var targetX = canvas.width - ballRadius;

// 更新小球
function updateBall(){
  // 当前速度 = (最终位置 - 当前位置) * 缓动系数
  vx = (targetX - ballX) * easing;
  // 新的位置 = 当前位置 + 当前速度
  ballX += vx;
}

//...
```

[效果如下](https://canvas-demo.kai666666.top/12/01.html)：

![缓动动画](1.gif)

由上面公式中我们可以知道，缓动系数越大运动的越快。

## 带有角度的缓动动画 ##

带有角度的缓动动画也是一样的，只要把y轴上的分量也计算进去就可以了。

```JavaScript
//...

// 设置起始位置在左上角
var ballX = 0;
var ballY = 0;
// 速度 具体是多少在update的时候计算
var vx,vy;
// 缓动系数
var easing = 0.03;
// 最终位置 在右下角
var targetX = canvas.width - ballRadius;
var targetY = canvas.height - ballRadius;

// 更新小球
function updateBall(){
  // 当前速度 = (最终位置 - 当前位置) * 缓动系数
  vx = (targetX - ballX) * easing;
  vy = (targetY - ballY) * easing;
  // 新的位置 = 当前位置 + 当前速度
  ballX += vx;
  ballY += vy;
}

//...
```

[效果如下](https://canvas-demo.kai666666.top/12/02.html)：

![带有角度的缓动动画](2.gif)

由上可以，缓动动画只需要根据给定结束的位置就可以了，无需根据角度再进行计算，使用起来非常方便。通常由于缓动动画比摩擦力更细滑，所以减速后停来下的动画，基本上都用缓动动画。

## 缓动动画的其他使用场景 ##

缓动动画计算的过程其实一个简单数学推到，本身并不是什么高深的东西（当然做出来的效果确实很好）。我们的思维不能定势到只能做物体移动的动画，只要有从状态A平滑变化到状态B的场景都可以使用缓动动画，就比如宽高的变化，颜色的变化，透明度的变化等等。我们这里给一个小球半径变化的例子：

```JavaScript
//...

// 小球画在中间位置
var ballX = centerX;
var ballY = centerY;
// 缓动系数
var easing = 0.03;
// 最终位置 在右下角
var targetBallRadius = 70;
// 半径变化速度
var vRadius;

// 更新小球
function updateBall(){
  // 当前速度 = (最终位置 - 当前位置) * 缓动系数
  vRadius = (targetBallRadius - ballRadius) * easing;
  // 新的位置 = 当前位置 + 当前速度
  ballRadius += vRadius;
}

//...
```

[效果如下](https://canvas-demo.kai666666.top/12/03.html)：

![缓动动画的其他使用场景](3.gif)

## 弹性动画 ##

缓动动画，当物体运动到终点的位置就会停下来；弹性动画，当物体运动到终点位置，会继续往前运动一下，然后反弹过来。那么怎么实现弹性动画呢？说出来你可能会不相信，缓动动画是速度使用缓动方程，而弹性动画是加速度使用缓动方程。也就是说：

>当前加速度 = (最终位置 - 当前位置) \* 弹性系数。
>新的速度 = 当前速度 + 当前加速度。
>新的位置 = 当前的位置 + 新的速度。

我们先来看一个例子：

```JavaScript
//...

// 设置起始位置在左边
var ballX = ballRadius;
var ballY = centerY;
// 初始速度
var vx = 0;
var vy = 0;
// 加速度
var ax;
// 弹性动画系数
var spring = 0.01;
// 最终位置 在最右边
var targetX = centerX;

// 更新小球
function updateBall(){
  // 当前加速度 = (最终位置 - 当前位置) * 弹性系数
  ax = (targetX - ballX) * spring;
  // 新的速度 = 当前速度 + 当前加速度
  vx += ax;
  // 新的位置 = 当前的位置 + 新的速度
  ballX += vx;
}

//...
```

[效果如下](https://canvas-demo.kai666666.top/12/04.html)：

![弹性动画](4.gif)

小球从左边，走到了中间，到中间的时候加速度是0，再往右一点，加速度是负数也就是减速，等减速到最右边的时候速度为0，然后向左边加速。通过上面公式我们发现第一个公式跟缓动公式是一样的，只是结果一个是加速度一个是速度，至于系数虽然这里叫的不一样，其实代表的含义差不多。

## 带有摩擦力的弹性动画 ##

上面的弹性动画是理想状态下的，就是物理上所说的绝对光滑的情况下才会发生，而现实中往往是具有摩擦力的。摩擦力我们之前学过，弹性动画我们也学过，如果把两者结合起来就是带有摩擦力的弹性动画，公式如下：

> 当前加速度 = (最终位置 - 当前位置) \* 弹性系数。
> 没有摩擦力的新的速度 = 当前速度 + 当前加速度。
> 带有摩擦力的新的速度 = 没有摩擦力的新的速度 \* 摩擦系数。
> 新的位置 = 当前的位置 + 带有摩擦力的新的速度

```JavaScript
//...


// 设置起始位置在左边
var ballX = ballRadius;
var ballY = centerY;
// 初始速度
var vx = 0;
var vy = 0;
// 加速度
var ax;
// 弹性动画系数
var spring = 0.01;
// 摩擦力系数
var friction = 0.98;
// 最终位置 在最右边
var targetX = centerX;

// 更新小球
function updateBall(){
  // 当前加速度 = (最终位置 - 当前位置) * 弹性系数
  ax = (targetX - ballX) * spring;
  // 没有摩擦力的新的速度 = 当前速度 + 当前加速度
  vx += ax;

  // 带有摩擦力的新的速度 = 没有摩擦力的新的速度 * 摩擦系数
  vx *= friction;
  // 新的位置 = 当前的位置 + 带有摩擦力的新的速度
  ballX += vx;
}

//...
```

[效果如下](https://canvas-demo.kai666666.top/12/05.html)：

![带有摩擦力的弹性动画](5.gif)

建议你自己写一写代码，或者自己把代码下载下来运行一下，代码地址：[https://github.com/KaiOrange/canvas-demo](https://github.com/KaiOrange/canvas-demo)。
