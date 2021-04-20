---
title: Canvas系列（11）：动画中级
date: 2019-06-30 14:47:10
author: Orange
tag:
	- Canvas
categories: Canvas
---

上一章我们讲了简单的动画是如何绘制的，如果没有看上一章的童鞋，请点[这里](/2019/06/30/Canvas系列（10）：动画初级/#more)，本章的内容也是接着上一章的内容，代码也只修改其中部分。

----

## 加速运动 ##

我上章中，涉及直线的运动，其速度都是恒定的，现在我们做一下加速的运行，同样的我们只给出核心的代码。

```JavaScript
//...

// 设置x的值放在最左边
var ballX = ballRadius;
var ballY = centerY;
// x的速度 初始值是0 然后逐渐加速
var vx = 0;
// 加速度
var ax = 0.1;

    // 更新小球
function updateBall(){
  ballX += vx;
  // 改变速度
  vx += ax;
}

//...
```

[效果如下](https://canvas-demo.kai666666.com/11/01.html)：

![加速运动](1.gif)

那么减速运动怎么做呢？没错只要把加速度改一下就可以了，当然我们肯定要给一个初始速度：

```JavaScript
//...

// 设置x的值放在最左边
var ballX = ballRadius;
var ballY = centerY;
// x的速度 初始值是0 然后逐渐加速
var vx = 7;
// 加速度
var ax = -0.1;

// 更新小球
function updateBall(){
  ballX += vx;
  // 改变速度
  vx += ax;
}

//...
```

[效果如下](https://canvas-demo.kai666666.com/11/02.html)：

![减速运动](2.gif)

我们看到，小球先向右减速，当速度减到0的时候，然后又像左加速了，和物理课上讲的是一样的。

## 带角度的加速运动 ##

带角度的加速运动，和之前的一样，由于加速度不变，我们需要对加速度分解。

```JavaScript
//...

// 设置球的起始位置在左上角
var ballX = 0;
var ballY = 0;
// 初始速度
var vx = 0;
var vy = 0;
// 角度
var angle = 45;
// 加速度是0,1
var a = 0.1;
// 计算加速度分量
var ax = a * Math.cos(angle * Math.PI / 180);
var ay = a * Math.sin(angle * Math.PI / 180);

// 更新小球
function updateBall(){
  ballX += vx;
  ballY += vy;
  // 改变速度
  vx += ax;
  vy += ay;
}

//...
```

[效果如下](https://canvas-demo.kai666666.com/11/03.html)：

![带角度的运动](3.gif)

## 抛物线运动 ##

看到刚才的加速运动，我想问你自由落体运动怎么做？自由落体运动就是初速度为0，然后y方向上有一个加速度，我们第一个例子是x方向上的加速度，相信以你现在的实力，做出来是完全没问题的。现在我们看一下抛物线运动，抛物线运动是水平方向上的匀速直线运动，就可以了。

```JavaScript
//...

// 设置球的起始位置在左下角
var ballX = 0;
var ballY = canvas.height;
// 初始速度
var vx = 3;
// y方向初始速度向上
var vy = -5;
// y方向上的加速度是0.1（9.8太大了，所以就用了一个小的加速度）
var ay = 0.1;

// 更新小球
function updateBall(){
  ballX += vx;
  ballY += vy;
  // 改变y方向上的速度
  vy += ay;
}

//...
```

[效果如下](https://canvas-demo.kai666666.com/11/04.html)：

![抛物线运动](4.gif)

## 带反弹的抛物线运动 ##

增加一点难度，小球触碰到最下面那么将反弹，通常反弹会损失一点能量，我们就设置每次反弹后的速度是原来的80%。

```JavaScript
//...

// 设置球的起始位置在左下角
var ballX = 0;
// y先抬高一点
var ballY = canvas.height - ballRadius;
// 初始速度
var vx = 2;
// y方向初始速度向上
var vy = -4;
// y方向上的加速度是0.1（9.8太大了，所以就用了一个小的加速度）
var ay = 0.1;
// 符号表示方向 反弹后速度减小
var bounce = -0.8;

// 更新小球
function updateBall(){
  ballX += vx;
  ballY += vy;

  // 如果小球的高度 到最下面了 那么就设置最下面你的值 并且就反弹
  if (ballY > canvas.height - ballRadius) {
    ballY = canvas.height - ballRadius;
    vy = vy * bounce;
  }

  // 改变y方向上的速度
  vy += ay;
}

//...
```

[效果如下](https://canvas-demo.kai666666.com/11/05.html)：

![带反弹的抛物线运动](5.gif)

## 摩擦力 ##

带有摩擦力的运动往往速度会逐渐变小直到为0（我们这里不考虑其他外力的作用），这和上面带有反方向加速度的减速运动很相似，但是减速运动速度为0的时候会反方向加速，带有摩擦力的运动不会反向加速。我们就改一改上面的那个减速的运动，直接把加速度改成摩擦力。

```JavaScript
//...

// 设置x的值放在最左边
var ballX = ballRadius;
var ballY = centerY;
// x的速度 初始值是0 然后逐渐加速
var vx = 7;
// 摩擦力系数
var friction = 0.97;

// 更新小球
function updateBall(){
  ballX += vx;
  // 速度减小
  vx *= friction;
}

//...
```

[效果如下](https://canvas-demo.kai666666.com/11/06.html)：

![摩擦力](6.gif)
