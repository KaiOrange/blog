---
title: Canvas系列（18）：实战-烟花效果
date: 2024-11-25 20:00:00
tag:
	- Canvas
categories: Canvas
---

今天我们来学习 Canvas 的一个经典案例 —— 烟花效果，具体效果可以看下图。本章的内容会涉及之前的加速度和速度相关的知识，如果对这部分不太了解的建议先看[其他章节](https://www.kai666666.com/categories/Canvas/)。

![烟花效果](1.gif)

----

## 画一个点 ##

Canvas效果往往需要我们去逐帧观察，烟花效果也一样。我们先看单个烟花，在不考虑拖尾的情况下，烟花先往上飞，飞行过程中越来越慢，当飞到一定高度以后爆炸开来，爆炸效果是变换成好多朝四面八法飞去的小粒子。我们直接绘制烟花有点困难，那么就把问题进行拆分，先不绘制整个烟花，而是先画一个点，这个点可以是起飞的烟花粒子，也可以是爆炸开的烟花粒子。

```JavaScript
class Particle {
  constructor(context, options = {}){
    this.context = context;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.vx = options.vx || 0;
    this.vy = options.vy || 0;
    this.ax = options.ax || 0;
    this.ay = options.ay || 0;
    this.radius = options.radius || 4;
    this.hColor = options.hColor ?? 180;
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
    this.context.fillStyle = `hsl(${this.hColor} 100% 50%)`;
    this.context.arc(this.x, this.y, this.radius, Math.PI / 180 * 0, Math.PI / 180 * 360);
    this.context.closePath();
    this.context.fill();
    this.context.restore();
  }
}
```

这段代码跟我们之前的动画章节的代码很类似。`Particle` 类接收2个参数，一个是 `canvas` 的上下文 `context`，另一个是配置项。其中 `vx` , `vy` 分别是 `x` 和 `y` 轴上的速度的分量；`ax`，`ay` 分别是 `x` 和 `y` 轴上的加速度的分量。我们绘制粒子，实际上绘制的是圆形，因为半径`radius`很小的圆形就是一个点，当然这里绘制成长度很小的方形也是OK的。值得注意的是我们绘制的 `fillStyle` 使用的是 `hsl` 颜色格式，而不是我们经常使用的 `rgb` 格式，因为 `hsl` 格式只要控制第一个色相参数就可以显示不同的颜色了，这比 `rgb` 方便些。另外构造方法中赋初始值的时候 `hColor` 使用了 `??` 表达式，为了保证即使传入 `0` 也能正常显示颜色。这是ES11的语法，生产环境需要用 `babel` 编译成低版本的语法，我们这里作为示例就不转换了，相信你用的是高版本的Chrome浏览器。

现在我们使用上面的 `Particle` 类来绘制一个点：

```JavaScript
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let canvasWidth = canvas.width = window.innerWidth;
let canvasHeight = canvas.height = window.innerHeight;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;
};

resizeCanvas();

window.addEventListener('resize', resizeCanvas);

const particle = new Particle(context, {
  x: canvasWidth / 2,
  y: canvasHeight / 2,
});

particle.draw();
```

这里我们在canvas的中心绘制了一个点，[效果如下](https://canvas-demo.kai666666.com/18/01.html)：

![绘制一个点](2.png)


## 画一个烟花 ##

在绘制烟花之前我们先写一个 `random` 的工具方法，用来生成随机数。

```JavaScript
const random = (min = 1, max) => {
  if (max === undefined) {
    max = min;
    min = 0;
  }

  return Math.random() * (max - min) + min;
};
```
上述 `random` 如果传一个参数的时候，则会生成 `0 ~ 当前值` 的随机数，如果传两个参数的时候，第一个值表示最小值，第二个值表示最大值。这里我们生成的仍然是小数随机数，如果需要整数可以使用 `Math.floor()` 方法取整。

有了 `random` 函数以后我们可以画烟花了。烟花实际可以分成2部分，首先是一个从下到上飞的大一点的粒子，当飞到粒子最高点的时候，粒子爆炸，爆炸形成很多个从爆炸点周围向四周飞的小粒子。

通过上面描述我们的代码基本上就有了，首先我们定义一个 `Firework` 类，它有以下几个成员属性：

- `isExplode`: 是否爆炸
- `baseParticle`: 未爆炸起飞的粒子 
- `particles`: 爆炸开的粒子数组
- `hColor`: 粒子颜色的hsl的色相参数

我们在未爆炸前绘制的是 `baseParticle`，当爆炸以后就变成了绘制 `particles` 数组，这就是爆炸的核心逻辑。现在还有一个问题，如何判断粒子爆炸呢？其实也容易，当粒子飞到最顶端爆炸时，此时粒子的速度为 `0` ，而此前粒子的速度是负数（canvas的y轴向下，负数表示朝上），所以可以通过判断例子是否大于等于0来判断是否飞到最顶端，之所以不只判断等于 `0` ，是因为飞到最顶端的时候例子在这一帧可能不是刚好是 `0` 。

```JavaScript
class Firework {
  isExplode = false
  baseParticle = null
  particles = []
  hColor = 180

  constructor() {
    this.hColor = Math.floor(random(360))
    this.baseParticle = new Particle(context, {
      x: canvasWidth / 2,
      y: canvasHeight,
      vy: -random(14, 20),
      ay: 0.4,
      radius: 2,
      hColor: this.hColor,
    });
  }

  update() {
    if (!this.isExplode) {
      this.baseParticle.update()
      if (this.baseParticle.vy >= 0) {
        this.explode()
      }
    } else {
      this.particles.forEach(item => {
        item.update()
      })
    }
  }
  
  draw() {
    if (!this.isExplode) {
      this.baseParticle.draw()
    } else {
      this.particles.forEach(item => {
        item.draw()
      })
    }
  }

  explode() {
    // TODO:
  }
}
```

上述代码中，我们在 `x` 为 `canvasWidth / 2` ，`y` 为 `canvasHeight` ，也就是中间的最下面生成一个向上飞的粒子。现在我们考虑一下如何让粒子爆炸，首先需要生成爆炸的粒子，然后标记 `isExplode` 为 `true`。

```JavaScript
class Firework {
  // ... 其他代码

  explode() {
    for (let i = 0; i < 100; i++) {
      const angle = random(Math.PI * 2)
      const length = random(3)
      this.particles.push(new Particle(context, {
        x: this.baseParticle.x,
        y: this.baseParticle.y,
        vx: Math.cos(angle) * length,
        vy: Math.sin(angle) * length,
        ay: 0.1,
        radius: 1,
        hColor: this.hColor,
      }))
    }
    this.isExplode = true
  }
}
```

这里生成了 `100` 个爆炸后的粒子，爆炸的颜色跟当前烟花的颜色是相同的。生成的速度是朝四周方向，大小是随机生成小于 `3` 的向量，这里的计算可以参考下图。长度是`0 ~ 3` 的随机值，角度是 `0 ~ 2π`的随机值，然后计算 `x` 坐标和 `y` 坐标，可以看的出来 `x` 是 `Math.cos(angle)` ， `y` 是 `Math.sin(angle)` 。

![坐标计算示意图](3.png)

现在我们有了 `Firework` 类，就可以把它绘制到 `canvas` 上了：

```JavaScript
const firework = new Firework();

function animate (){
  requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height);

  firework.update();
  firework.draw();
}

animate()
```

此时的[效果如下](https://canvas-demo.kai666666.com/18/02.html)：

![画一个烟花](4.gif)

## 粒子爆炸后颜色逐渐变暗 ##

`Particle` 类中我们添加了一个生命值的属性 `lifespan`，根据它的大小来显示爆炸后烟花的颜色，由于 `hsl` 颜色的第三个值刚好就是明亮度，我们之前使用的是 `50%` ，现在我们可以把明亮度的值从 `lifespan` 映射到`50% ~ 0%`，代码改动也不多，如下：

```JavaScript
class Particle {
  constructor(context, options = {}){
    // ... 其他代码
    this.isExplode = options.isExplode ?? false
    this.lifespan = 100
  }

  update() {
    if (this.isExplode) {
      this.lifespan -= 2;
    }
    // ... 其他代码
  }

  draw() {
    // ... 其他代码
    this.context.fillStyle = `hsl(${this.hColor} 100% ${this.lifespan / 2}%)`;
    // ... 其他代码
  }
}

class Firework {
  //... 其他代码

  explode() {
    for (let i = 0; i < 100; i++) {
      //... 其他代码
      this.particles.push(new Particle(context, {
        //... 其他代码
        isExplode: true, // 新增爆炸判断
      }))
    }
    this.isExplode = true
  }
}
```

此时的[效果如下](https://canvas-demo.kai666666.com/18/03.html)：

![粒子爆炸后颜色逐渐变暗](5.gif)

## 画多个烟花 ##

首先我们把烟花的 `x` 坐标也修改成随机生成值，这里设置的范围是从 `20` 到 `canvasWidth - 20` 像素之间。由于是多个烟花，所以需要定义一个烟花的数组 `fireworks` 。生成烟花这里我们也是有技巧的，在每一帧生成一个随机数（默认从0到1），让屏幕宽度中每100个像素有 `0.006` 的概率生成一个烟花。具体代码如下：

```JavaScript
class Firework {
  // ... 其他代码

  constructor() {
    this.hColor = Math.floor(random(360))
    this.baseParticle = new Particle(context, {
      x: random(20, canvasWidth - 20),
      // ... 其他代码
    });
  }

  // ... 其他代码
}
const fireworks = []
fireworks.push(new Firework());

function animate (){
  requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (random() < (0.006 * canvasWidth / 100)) {
    fireworks.push(new Firework());
  }

  fireworks.forEach(item => {
    item.update();
    item.draw();
  })
}

animate()
```

此时看着非常OK，[效果如下](https://canvas-demo.kai666666.com/18/04.html)：

![画多个烟花](6.gif)

## 内存泄漏处理 ##

上述代码看着貌似没什么问题，但运行的时间一长就会发现逐渐变得卡顿，这是因为每一个粒子在离开屏幕后仍然在绘制，从而导致内存泄露了，所以我们需要对已完成使命的粒子或烟花进行销毁。

```JavaScript
class Particle {
  // ... 其他代码

  isDone() {
    return this.lifespan <= 0
  }
}

class Firework {
  // ... 其他代码

  update() {
    if (!this.isExplode) {
      this.baseParticle.update()
      if (this.baseParticle.vy >= 0) {
        this.explode()
      }
    } else {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        this.particles[i].update()
        if (this.particles[i].isDone()) {
          this.particles.splice(i, 1)
        }
      }
    }
  }
  
  // ... 其他代码

  isDone() {
    return this.isExplode && this.particles.length === 0;
  }
}

// ... 其他代码

function animate (){
  // ... 其他代码

  for (let i = fireworks.length - 1; i >= 0; i--) {
    const item = fireworks[i];
    item.update();
    if (item.isDone()) {
      fireworks.splice(i, 1);
    } else {
      item.draw();
    }
  }
}
```

我们在 `Particle` 和 `Firework` 类中都添加 `isDone` 方法来判断是否完成使命，粒子完成使命的标志是粒子完全暗，烟花完成使命的标志是爆炸了且所有爆炸后的粒子都完全变暗，最后需要注意的是移除粒子和烟花是从后往前循环的，避免因移除过程中数组长度变化而产生的问题。

此时效果跟上图几乎一样，只是不会因为时间过长而卡顿，具体效果可以[点击这里](https://canvas-demo.kai666666.com/18/05.html)。

## 爆炸后添加空气阻力 ##

现实中，烟花爆炸后比较轻，受到空气阻力的影响，烟花粒子在下降过程明显变慢了。阻力我们在之前的章节中也讲过，就是速度乘以一个接近1的系数，这块不熟悉的同学可以看[这里的摩擦力章节](https://www.kai666666.com/2019/06/30/Canvas系列（11）：动画中级/)。

```JavaScript
class Particle {
  // ... 其他代码
  update() {
    if (this.isExplode) {
      this.lifespan -= 2;
      this.vx *= 0.98;
      this.vy *= 0.98;
    }
    this.vx += this.ax;
    this.vy += this.ay;
    this.x += this.vx;
    this.y += this.vy;
  }

  // ... 其他代码
}
```

此时，[效果如下](https://canvas-demo.kai666666.com/18/06.html)：

![爆炸后添加空气阻力](7.gif)

## 拖尾效果 ##

我们每次使用 `context.clearRect()` 方法来清屏，这里如果我们不调用 `context.clearRect()` 方法就会有粒子的飞行轨迹了，但是这也不是我们要的拖尾效果，不调用 `context.clearRect()` 方法效果如下：

![不调用context.clearRect()](8.png)

为了实现拖尾效果，我们可以在每次绘制之前先绘制一个透明度为 `0.2` 的黑色矩形，然后再绘制烟花，这样每次绘制保留了上一次淡淡的绘制效果，所以看上去就有了拖尾效果了，代码如下：

```JavaScript
function animate (){
  requestAnimationFrame(animate);
  // context.clearRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = 0.2;
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalAlpha = 1;

  //... 其他代码
}
```

大功告成，整体效果[请看这里](https://canvas-demo.kai666666.com/18/07.html)。