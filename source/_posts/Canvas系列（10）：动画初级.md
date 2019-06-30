---
title: Canvas系列（10）：动画初级
date: 2019-06-30 08:38:59
author: Orange
tag:
	- Canvas
categories: Canvas
---

今天开始就要讲一些进阶的东西了，是不是很兴奋呢？

----

## requestAnimationFrame ##

所谓动画其实就是快读绘制图片，由于人的眼睛更不上屏幕绘制的速率，所以看到的就好像连着的一样，也就形成了动画，动画片就是这个原理，canvas中的动画也是这个原理。提到动画就不得不说一个函数了，那就是`requestAnimationFrame`。这是一个定时执行的函数，类似于`setTimeout`，只是间隔时间不再有我们自己手动去设定，而是由计算机自己去计算，这样比我们直接设定的误差更小（通常我们是定1000/60，约等于16.7毫秒，因为CPU的频率一般是60Hz，也就是1秒最多可以刷新60次界面）。但是往往浏览器对`requestAnimationFrame`的支持不够友好，那这就需要polyfill，通常一种简单的polyfill可以这么写：

```JavaScript
if (!Date.now)
    Date.now = function() { return new Date().getTime(); };

window.requestAnimationFrame = (function(){
  var lastTime = 0;
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return window.setTimeout(function() {
              callback(lastTime = nextTime);
            },nextTime - now);
          };
})();

// 与之对应的清空定时器的polyfill
window.cancelAnimationFrame = (function(){
  return  window.cancelAnimationFrame       ||
          window.webkitCancelAnimationFrame ||
          window.mozCancelAnimationFrame    ||
          window.clearTimeout
})();
```

我们可以看到，他的做法是如果没有`requestAnimationFrame`那么使用`setTimeout`来做回退处理。通过上面我们可以看到`callback`有一个参数，就是时间，通常对于游戏等精度要求比较高的情况下我们使用这个时间和速度来计算当前帧的位置，这样可以有效避免，硬件配置所带来的优势。举个例子，比如我配置高可能比配置低的多画了几帧，那么同样的速度我就比别人走的快，而基于这个时间来计算的话就不会有问题了，如果配置低的少绘制几帧，那么时间间隔会变大相同的速度，距离也会边远。这就相当于直接跳过了中间几帧。当然对于这个时间的值不同浏览器实现的方式可能不一样，就比如谷歌的是从0毫秒开始逐渐递增的，有的浏览器是当前的毫秒数逐渐递增的，对于绘制图像的时候我们更多的是关注时间差，所以影响不是很大，就比如谷歌的第一帧传的时间可能是0，第二帧可能传的是17，而某些浏览器可能第一帧传的是1561859029000，第二帧传的是1561859029017，我们计算的时候往往是根据两者的差17来计算下一帧的位置。当然，对于一些简单与时间无关的动画特效，也可以不用关注这个时间，直接根据每次绘制时增加的速度去计算就好了，我们这里为了简单起见就不去动这个事件了。同时为了减少代码的长度我们就不使用polyfill了，如果是一个上线的项目最好使用上。

## 匀速直线运动 ##

匀速直线运动是最简单的动画，由于我们现在需要不断地檫除然后重新绘制，所以我们需要重新给出我们此时的JavaScript代码，如下：

```JavaScript
var canvas = document.getElementById("canvas");
var context = canvas.getContext('2d');
var sW = 1;
var lW = 4;
var spacing = 10;

// 绘制坐标系
function drawCoordinate(){
  context.beginPath();
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
  context.strokeStyle='black';
  context.stroke();
}


// 其他代码

// 中心坐标(centerX,centerY)
var centerX = canvas.width / 2;
var centerY = canvas.height / 2;

// 小球圆心的坐标
var ballX = centerX;
var ballY = centerY;
// 小球的半径
var ballRadius = 20;

// 更新小球
function updateBall(){
  ballX += 1;
  // 如果超出去 那么回到初始位置
  if (ballX > 300 + ballRadius) {
    ballX = -ballRadius;
  }
}

// 绘制小球
function drawBall(){
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, Math.PI / 180 * 0, Math.PI / 180 * 360);
  context.closePath();
  context.fillStyle='orange';
  context.fill();
}

// 此时没有轨迹的绘制 所以就是一个空函数
function drawLocus(){}

function animate(){
  // 清屏
  context.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制坐标系
  drawCoordinate();

  //绘制轨迹 有可能会用到 当前是空
  drawLocus();

  // 更新小球位置
  updateBall();
  // 绘制球
  drawBall();

  // 递归调用
  requestAnimationFrame(animate);
}

// 启动动画
requestAnimationFrame(animate);
```

看到`animate`还是了吗，此函数是canvas动画的“套路”，一定要熟悉它，几乎所有动画相关的代码都有该函数的身影。此时的效果如下：

![匀速直线运动](1.gif)

## 匀速圆周运动 ##

匀速圆周运动和匀速直线运动代码差不多，唯一不同的地方就是`drawBall`和`updateBall`这两个方法，当然涉及到一点小小的数学计算，这里直接给出变动的部分，变动的代码大多数也是相似的，你只要把注意力放在`updateBall`中就好了：

```JavaScript
// ...

// 圆周运动半径
var radius = 50;
// 小球的角度
var angle = 0;

// 更新小球
function updateBall(){
  ballX = centerX + Math.cos(angle) * radius;
  ballY = centerY + Math.sin(angle) * radius;
  // 需要注意的是Math.cos和Math.sin中的参数是弧度而不是角度
  // 也就是说2*Math.PI是一周约等于6.28 这里每次加0.08弧度
  angle += 0.08;
}

// 绘制轨迹
function drawLocus(){
  context.beginPath();
  context.arc(centerX, centerY, radius, Math.PI / 180 * 0, Math.PI / 180 * 360);
  context.closePath();
  context.strokeStyle='red';
  context.stroke();
}

// ...
```

出来的效果如下：

![匀速圆周运动](2.gif)

## 椭圆运动 ##

圆周运动和椭圆运动很相似，直接给代码：

```JavaScript
// ...

// 椭圆运动半径
var radiusX = 100;
var radiusY = 50;
// 小球的角度
var angle = 0;

// 更新小球
function updateBall(){
  ballX = centerX + Math.cos(angle) * radiusX;
  ballY = centerY + Math.sin(angle) * radiusY;
  angle += 0.08;
}

// 轨迹
function drawLocus(){
  // 绘制椭圆
  context.save();
  context.beginPath();
  // 把圆缩放后使之形成椭圆
  context.scale(1, radiusY / radiusX);
  // 因为缩放是相对于坐标系的 所以需要平移
  context.translate(0, centerY);
  context.arc(centerX, centerY, radiusX, Math.PI / 180 * 0, Math.PI / 180 * 360);
  context.strokeStyle='red';
  context.stroke();
  context.restore();
}

// ...
```

出来的效果如下：

![椭圆运动](3.gif)

## 左右来回运动 ##

通过观察我们可以发现，椭圆运动和圆周运动的区别就是椭圆运动的某一个轴的半径和另一个轴的半径是不同的，那么如果某一个周的半径是0会发生什么情况呢。这就是左右来回的运动。我们修改一下代码，并且把绘制轨迹的函数`drawCoordinate`去掉吧：

```JavaScript

// 小球的角度
var angle = 0;
var radiusX = 100;

// 更新小球
function updateBall(){
  ballX = centerX + Math.sin(angle) * radiusX;
  angle += 0.08;
}

```

出来的效果如下：

![左右来回运动](4.gif)

## 正弦运动 ##

上面是y不变，x利用三角函数计算的值，现在我们x每次增加一点，然后y轴使用三角函数，那就是正弦运动了。

```JavaScript
// 小球的角度
var angle = 0;
var radiusX = 100;
var radiusY = 50;
var ballRadius = 20;

// 更新小球
function updateBall(){
  ballX += 2;
  ballY = centerY + Math.sin(angle) * radiusY;
  angle += 0.08;
  // 超出去以后左边显示
  if (ballX > 300 + ballRadius) {
    ballX = -ballRadius;
  }
}
```

出来的效果如下：

![正弦运动](5.gif)

## 带角度的匀速运动 ##

更多的时候我们会遇到带有一定角度的匀速运动，比如速度是每次更新2个像素，那么实际上x和y都是他的一个分量，现在看一下代码：

```JavaScript
// 这里写角度看起来比较直观
var angle = 45;
var spend = 2;

// 更新小球
function updateBall(){
  // 绘制的时候需要把角度转换为弧度
  var vx = Math.cos(angle * Math.PI / 180) * spend;
  var vy = Math.sin(angle * Math.PI / 180) * spend;
  ballX += vx;
  ballY += vy;
}
```

出来的效果如下：

![匀速直线运动](6.gif)

我们可以看到小球在二维坐标系中的运动和速度的分解与合成有很大的关系。良好的数学和物理知识将帮助我们在这条路上走的更远。
