---
title: Canvas系列（15）：实战-小球拖拽
date: 2020-08-03 14:57:25
author: Orange
tag:
	- Canvas
categories: Canvas
---

在[上一章](https://www.kai666666.com/2020/07/28/Canvas%E7%B3%BB%E5%88%97%EF%BC%8814%EF%BC%89%EF%BC%9A%E5%AE%9E%E6%88%98-%E5%B0%8F%E7%90%83%E7%A2%B0%E6%92%9E/)中我们实现的小球的碰撞，这章中我们继续玩玩小球，讲解一下小球的拖拽，为了避免代码的混乱本章中就不考虑小球碰撞的情况了，有兴趣的自己看看上一章。

在本章开始的时候，我必须告诉大家一个沮丧事实，Canvas绘制的图形并没有事件来直接操作改图形，这是因为Canvas的整个标签是一个DOM元素，所以DOM操作的事件是作用的整个Canvas标签的，而不是绘制的图形。就比如我们点击Canvas中的小球，并没有直接的事件来监听小球被点击了；我们只能监听Canvas这个DOM元素被点击了，，但是我们可以通过其他方法来模拟一些事件来操作它们，比如我们可以计算鼠标在DOM元素中的位置来判断是否点击到小球上了。好了，开始本章吧！

----

## 继续上章刚开始的例子 ##

小球基本操作与上章刚开始的代码是差不多的，唯一的不同是`checkWalls`函数我们给x轴碰撞到墙壁的时候也添加了能量的损耗，[具体代码如下](https://canvas-demo.kai666666.com/15/01.html)：

```JavaScript
// 获取元素
let canvas = document.getElementById('canvas');
// 获取上下文
let context = canvas.getContext('2d');

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
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, Math.PI / 180 * 0, Math.PI / 180 * 360);
    this.context.fillStyle = this.color;
    this.context.closePath();
    this.context.fill();
  }
}

let balls = []

balls.push(new Ball(context,{
  x:20,
  y:20,
  vx:3,
  vy:2,
  ay:0.5,
  color:'red',
}));

balls.push(new Ball(context,{
  x:canvas.width - 20,
  y:20,
  vx:-3,
  vy:2,
  ay:0.5,
  color:'blue',
}));


function checkWalls(ball){
  // 边界反弹
  if (ball.x < ball.radius) {
    ball.x = ball.radius;
    ball.vx *= -0.95;
  } else if (ball.x > canvas.width - ball.radius) {
    ball.x = canvas.width - ball.radius;
    ball.vx *= -0.95;
  }

  if (ball.y < ball.radius) {
    ball.y = ball.radius;
    ball.vy *= -0.95;
  } else if (ball.y > canvas.height - ball.radius) {
    ball.y = canvas.height - ball.radius;
    ball.vy *= -0.95; // 假设能量损耗是0.05
    ball.vx *= 0.99; // 摩擦力
  }
}

function draw(ball){
  ball.draw();
}

function animate (){
  requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height);

  balls.forEach(ball=>{
    // 更新小球的速度
    ball.update();
    // 检测是否碰撞到边界
    checkWalls(ball);
  });

  // 绘制
  balls.forEach(draw);
}

animate();
```

## 检测小球与鼠标接触 ##

小球与鼠标接触很简单，只要判断鼠标的位置是否在小球所在的圆内就可以了，这里给小球添加一个方法，用来判断点是否在圆内。

```JavaScript
class Ball {
  // ... 其他代码相同 这里就不再重复

  isContainsPoint(x,y){
    return Math.hypot(this.x - x ,this.y - y) < this.radius;
  }
}
```

这里使用了一个`Math.hypot`函数，这个函数是用来求平方根的，如`Math.hypot(3,4)`的结果是`5`；它的参数可以有多个，这里只用了2个。

接下来就是需要获取鼠标的`x`和`y`坐标了，这里就监听`mousemove`事件来获取。

```JavaScript
let offsetLeft = canvas.offsetLeft;
let offsetTop = canvas.offsetTop;
canvas.addEventListener('mousemove', (e) => {
  let x = e.pageX - offsetLeft;
  let y = e.pageY - offsetTop;
  balls.some(ball=>{
    if (ball.isContainsPoint(x,y)) {
      console.log('小球与鼠标接触了');
      return true;
    }
  })
}, false);
```

上述代码中我们通过鼠标在页面的坐标，然后减去Canvas左上角的位置来获取鼠标在Canvas中的位置，最后判断这个位置是否在小球内。

[可以点这里看效果](https://canvas-demo.kai666666.com/15/02.html)。

## 封装获取鼠标在Canvas位置的方法 ##

鼠标在Canvas中的位置对于Canvas的操作非常重要，所以我们这里就封装一个方法来获取鼠标的位置，具体如下：

```JavaScript
function captureMouse (element) {
  let mouse = {x: 0, y: 0, event: null};
  let offsetLeft = element.offsetLeft;
  let offsetTop = element.offsetTop;

  element.addEventListener('mousemove', (e) => {
    let x = e.pageX - offsetLeft;
    let y = e.pageY - offsetTop;

    mouse.x = x;
    mouse.y = y;
    mouse.event = e;
  }, false);

  return mouse;
};

let mouse = captureMouse(canvas)

canvas.addEventListener('mousemove', (e) => {
  let x = mouse.x;
  let y = mouse.y;
  balls.some(ball=>{
    if (ball.isContainsPoint(x,y)) {
      console.log('指针在小球内了！');
      return true;
    }
  })
}, false);
```

我们定义了一个`captureMouse`的方法，它返回一个对象`mouse`，只要在任何地方使用`mouse.x`和`mouse.y`就可以获取到当前鼠标在Canvas中的位置，是不是很方便？当然pageX和pageY存在一定的兼容性问题，为了保证在更多的浏览器中使用，需要对其做兼容性处理，[如下](https://canvas-demo.kai666666.com/15/03.html)：

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
```

## 模拟拖拽 ##

拖拽的过程是这样的，当鼠标按在小球上，那么选中小球；然后鼠标按着并移动鼠标的时候，小球也跟着移动，也就是`拖`的过程；最后松开鼠标，就是把小球释放了。这个过程可以通过`mousedown`，`mousemove`，`mouseup`三个事件来模拟。前面的过程也就是，当Canvas`mousedown`的时候，记录一下选中的小球；然后`mousedown`并且`mousemove`的时候移动小球；最后`mouseup`的时候释放选中的小球。这里有一个问题就是怎么能够既是`mousedown`又是`mousemove`呢？这里有2中方法，第一种就是监听`mousedown`并定义一个变量，然后再监听`mousemove`，并判断刚才定义的变量；第二种是在`mousedown`的事件处理程序中去监听`mousemove`，然后在`mouseup`的时候清除事件。由于`mousemove`是一个触发次数比较多的事件，为了保证性能，我们采用第二种办法，具体代码如下：

```JavaScript
// Canvas中的坐标
let mouse = captureMouse(canvas);
// 选中的小球
let selectedBall = null;

// 拖拽
canvas.addEventListener('mousedown', () => {
  balls.some(ball=>{
    if (ball.isContainsPoint(mouse.x, mouse.y)) {
      // 记录下选中的小球
      selectedBall = ball;
      // 添加事件来模拟拖拽
      canvas.addEventListener('mousemove', onMouseMove, false);
      canvas.addEventListener('mouseup', onMouseUp, false);
      return true;
    }
  })

  function onMouseMove () {
    selectedBall.x = mouse.x;
    selectedBall.y = mouse.y;
    selectedBall.vx = 0;
    selectedBall.vy = 0;
  }

  function onMouseUp () {
    selectedBall = null;
    // 清除事件
    canvas.removeEventListener('mousemove', onMouseMove, false);
    canvas.removeEventListener('mouseup', onMouseUp, false);
  }
}, false);
```

现在还有一个问题，就是当小球拖拽的时候，不应该再受到重力和自己的速度运动了，所以需要修改`animate`函数，只有当选中的小球和当前遍历的小球不相等的时候才去更新新的坐标，否则就用鼠标的坐标（上述代码也实现）：

```JavaScript
function animate (){
  requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height);

  balls.forEach(ball=>{
    if (selectedBall !== ball) {
      // 更新小球的速度
      ball.update();
      // 检测是否碰撞到边界
      checkWalls(ball);
    }
  });

  // 绘制
  balls.forEach(draw);
}
```

[此时的效果如下](https://canvas-demo.kai666666.com/15/04.html)：

![拖动小球](1.gif)

## 投掷 ##

我们刚才拖拽完了以后，由于速度设为了0，所以小球是做自由落体运动，而大多数情况下，我们更希望可以把小球投掷出去，那么当小球投掷的时候，需要计算小球的瞬时速度，这时我们就需要定义拖拽时上一次小球的坐标，并拖过简单的减法计算出瞬时速度，具体代码如下：

```JavaScript
// 旧的坐标位置
let oldX = 0;
let oldY = 0;

function animate (){
  requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height);

  balls.forEach(ball=>{
    if (selectedBall === ball) {
      trackVelocity();
    } else {
      // 更新小球的速度
      ball.update();
      // 检测是否碰撞到边界
      checkWalls(ball);
    }
  });

  // 绘制
  balls.forEach(draw);
}

animate();

// 拖拽
canvas.addEventListener('mousedown', () => {
  balls.some(ball=>{
    if (ball.isContainsPoint(mouse.x, mouse.y)) {
      // 记录下选中的小球
      selectedBall = ball;
      oldX = ball.x;
      oldY = ball.y;
      // 添加事件来模拟拖拽
      canvas.addEventListener('mousemove', onMouseMove, false);
      canvas.addEventListener('mouseup', onMouseUp, false);
      return true;
    }
  })

  // 其他代码相同
}, false);

function trackVelocity () {
  selectedBall.vx = selectedBall.x - oldX;
  selectedBall.vy = selectedBall.y - oldY;
  oldX = selectedBall.x;
  oldY = selectedBall.y;
}
```

[此时效果如下](https://canvas-demo.kai666666.com/15/05.html)：

![投掷小球](2.gif)

好了小球拖拽就完全做完了，完整代码请点[这里](https://github.com/KaiOrange/canvas-demo/blob/master/15/05.html)。
