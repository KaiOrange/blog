---
title: Canvas系列（17）：碰撞检测
date: 2021-03-05 14:12:25
author: Orange
tag:
	- Canvas
categories: Canvas
---

碰撞检测顾名思义就是检测两个物体是否发生碰撞，今天我们就来研究一下常用的碰撞检测技术。主要有圆与圆的碰撞检测，长方形与长方形的碰撞检测，以及圆与长方形的碰撞检测。

----

## 圆与圆的碰撞检测 ##

我们前几章，讲的都是小球相关的操作，这里的小球就是圆，那么首先讲的当然是圆的碰撞检测了。在说碰撞检测之前我们先把拖拽相关的代码复制一份，这样我们就可以边拖拽边检测物体是否碰撞检测了。拖拽相关的代码如下，为了简化拖拽的代码，这里我们只考虑2个小球的情况，如果对拖拽还不了解的同学可以参考[这篇文章](https://www.kai666666.com/2020/08/03/Canvas%E7%B3%BB%E5%88%97%EF%BC%8815%EF%BC%89%EF%BC%9A%E5%AE%9E%E6%88%98-%E5%B0%8F%E7%90%83%E6%8B%96%E6%8B%BD/)。

```JavaScript
function captureMouse (element) {
  let mouse = {x: 0, y: 0, event: null};
  let body_scrollLeft = document.body.scrollLeft;
  let element_scrollLeft = document.documentElement.scrollLeft;
  let body_scrollTop = document.body.scrollTop;
  let element_scrollTop = document.documentElement.scrollTop;
  let offsetLeft = element.offsetLeft;
  let offsetTop = element.offsetTop;

  element.addEventListener('mousemove', (e) => {
    let x, y;

    if (e.pageX || e.pageY) {
      x = e.pageX;
      y = e.pageY;
    } else {
      x = e.clientX + body_scrollLeft + element_scrollLeft;
      y = e.clientY + body_scrollTop + element_scrollTop;
    }
    x -= offsetLeft;
    y -= offsetTop;

    mouse.x = x;
    mouse.y = y;
    mouse.event = e;
  }, false);

  return mouse;
};

// 获取元素
let canvas = document.getElementById('canvas');
// 获取上下文
let context = canvas.getContext('2d');
// Canvas中的坐标
let mouse = captureMouse(canvas);
// 选中的对象
let selectedObj = null;

class Ball {
  constructor(context, options = {}){
    this.context = context;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.radius = options.radius || 20;
    this.color = options.color || '#000';
    this.vx = options.vx || 0;
    this.vy = options.vy || 0;
    this.ax = options.ax || 0;
    this.ay = options.ay || 0;
  }

  update() {
    this.vx += this.ax;
    this.vy += this.ay;
    this.x += this.vx;
    this.y += this.vy;
  }

  draw() {
    this.context.save();
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.arc(this.x, this.y, this.radius, Math.PI / 180 * 0, Math.PI / 180 * 360);
    this.context.closePath();
    this.context.fill();
    this.context.restore();
  }

  isContainsPoint(x,y){
    return Math.hypot(this.x - x ,this.y - y) < this.radius;
  }
}

let ball1 = new Ball(context,{
  x: canvas.width / 2 - 10,
  y: canvas.height / 2 - 10,
  color: 'blue',
})

let ball2 = new Ball(context,{
  x: canvas.width / 2 + 40,
  y: canvas.height / 2 - 10,
  color: 'green',
})

function animate (){
  requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制
  ball1.draw();
  ball2.draw();
}

animate();

// 拖拽
canvas.addEventListener('mousedown', () => {
  if (ball2.isContainsPoint(mouse.x, mouse.y)) {
    // 添加事件来模拟拖拽
    selectedObj = ball2;
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    return true;
  }

  function onMouseMove () {
    selectedObj.x = mouse.x;
    selectedObj.y = mouse.y;
    selectedObj.vx = 0;
    selectedObj.vy = 0;
  }

  function onMouseUp () {
    selectedObj = null;
    // 清除事件
    canvas.removeEventListener('mousemove', onMouseMove, false);
    canvas.removeEventListener('mouseup', onMouseUp, false);
  }
}, false);
```

都是之前的东西，[效果如下](https://canvas-demo.kai666666.com/17/01.html)。：

![拖动小球](1.gif)

圆与圆之间碰撞其实很简单，只要比较两圆圆心之间的距离和两圆半径之和的大小就可以了，若两圆圆心之间的距离大于两圆半径之和那么说明两圆没有发生碰撞，如果相等则表示刚好碰撞了，如果小于的时候，则说明两圆相交。这个在前面的内容你应该早有体会，毕竟我们可是研究过[小球碰撞](https://www.kai666666.com/2020/07/28/Canvas%E7%B3%BB%E5%88%97%EF%BC%8814%EF%BC%89%EF%BC%9A%E5%AE%9E%E6%88%98-%E5%B0%8F%E7%90%83%E7%A2%B0%E6%92%9E/)。

![圆与圆碰撞检测](2.png)

圆与圆碰撞检测的代码：

```JavaScript
function isCollisionBallAndBall(ball1, ball2) {
  return (ball1.x - ball2.x) ** 2 + (ball1.y - ball2.y) ** 2 <= (ball1.radius + ball2.radius) ** 2;
}
```

然后我们在animate方法中添加碰撞检测的逻辑，如果碰撞了则把绿色的小球变成红色，否则显示绿色。

```JavaScript
function animate (){
  requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (isCollisionBallAndBall(ball1, ball2)) {
    ball2.color = 'red'
  } else {
    ball2.color = 'green'
  }

  // 绘制
  ball1.draw();
  ball2.draw();
}
```

此时的[效果如下](https://canvas-demo.kai666666.com/17/02.html)：

![圆与圆碰撞](3.gif)

## 长方形与长方形的碰撞检测 ##

长方形与长方形的碰撞检测是FC游戏中用的最多的，FC好多游戏为了简化碰撞检测把一些看着不规则的物体也当做长方形来检测了，就是因为长方形好计算。例如，《超级玛丽》就是基于长方形检测的，你能看的出来吗？

![超级玛丽](4.gif)

在讲长方形之前我们先写一个长方形的类，并创建2个长方形对象：

```JavaScript
class Rect {
  constructor(context, options = {}){
    this.context = context;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 40;
    this.height = options.height || 40;
    this.color = options.color || '#000';
    this.vx = options.vx || 0;
    this.vy = options.vy || 0;
    this.ax = options.ax || 0;
    this.ay = options.ay || 0;
  }

  update() {
    this.vx += this.ax;
    this.vy += this.ay;
    this.x += this.vx;
    this.y += this.vy;
  }

  draw() {
    this.context.save();
    this.context.fillStyle = this.color;
    this.context.fillRect(this.x, this.y, this.width, this.height);
    this.context.restore();
  }

  isContainsPoint(x,y){
    return x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height;
  }
}

let rect1 = new Rect(context,{
  x: canvas.width / 2 - 40,
  y: canvas.height / 2 - 50,
  width: 80,
  height: 100,
  color: 'blue',
})

let rect2 = new Rect(context,{
  x: canvas.width / 2 + 80,
  y: canvas.height / 2,
  color: 'green',
})

```

长方形没有碰撞的时候无非就只有四种情况就是，一个方块在另一个方块上边的外面，或者右边的外面，或者下边外面，或者左边外面，具体如下。除了这四种情况外，其余的情况都是相交的。

![长方形与长方形的碰撞情况](5.png)

有了上面的知识，写代码就容易了：

```JavaScript
function isCollisionRectAndRect(rect1, rect2) {
  return !(rect1.x + rect1.width < rect2.x || rect2.x + rect2.width < rect1.x || rect1.y + rect1.height < rect2.y || rect2.y + rect2.height < rect1.y);
}
```

添加上拖拽以后，大概是下面[这个样子](https://canvas-demo.kai666666.com/17/03.html)：

![长方形与长方形的碰撞实例](6.gif)

## 圆与长方形的碰撞检测 ##

在类似于FC的游戏中，为了提高计算效率很少用到圆与长方形的碰撞检测，当然随着计算机性能的提高，圆与长方形的碰撞检测也变得越来越常见了。圆与长方形的碰撞检测首先是下面几种肯定是不会碰撞的。

![圆与长方形的碰撞情况](7.png)

当然除了这种情况以外，是不是一定会碰撞呢？答案是否定的，在四个角的时候，即使不满足这几种情况也没有碰撞，如下：

![圆与长方形的角落碰撞情况](8.png)

所以代码就是这几种情况综合考虑了：

```JavaScript
function isCollisionBallAndRect(ball1, rect1) {

  if (ball1.x + ball1.radius < rect1.x || rect1.x + rect1.width < ball1.x - ball1.radius || ball1.y + ball1.radius < rect1.y || rect1.y + rect1.height < ball1.y - ball1.radius) {
    return false
  }
  if (ball1.x < rect1.x) {
    if (ball1.y < rect1.y) { // 左上角
      return Math.hypot(ball1.x - rect1.x, ball1.y - rect1.y) < ball1.radius
    } else if (ball1.y > rect1.y + rect1.height) { // 左下角
      return Math.hypot(ball1.x - rect1.x, ball1.y - (rect1.y + rect1.height)) < ball1.radius
    }
  } else if (ball1.x > rect1.x + rect1.width) {
    if (ball1.y < rect1.y) { // 右上角
      return Math.hypot(ball1.x - (rect1.x + rect1.width), ball1.y - rect1.y) < ball1.radius
    } else if (ball1.y > rect1.y + rect1.height) { // 右下角
      return Math.hypot(ball1.x - (rect1.x + rect1.width), ball1.y - (rect1.y + rect1.height)) < ball1.radius
    }
  }

  return true
}
```

现在的[效果如下](https://canvas-demo.kai666666.com/17/04.html)：

![圆与长方形的碰撞实例](9.gif)
