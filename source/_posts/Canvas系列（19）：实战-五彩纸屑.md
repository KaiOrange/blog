---
title: Canvas系列（19）：实战-五彩纸屑
date: 2025-01-16 20:20:20
tag:
	- Canvas
categories: Canvas
---

[上一节](https://www.kai666666.com/2024/11/25/Canvas%E7%B3%BB%E5%88%97%EF%BC%8818%EF%BC%89%EF%BC%9A%E5%AE%9E%E6%88%98-%E7%83%9F%E8%8A%B1%E6%95%88%E6%9E%9C/)我们学习了如何通过 `Canvas` 来实现烟花效果，这节我们学习另一种效果 —— 五彩纸屑。具体效果如下：

![五彩纸屑效果](1.gif)

----

## 功能设计 ##

![示意图](2.png)

如上图所以，要实现五彩纸屑效果，需要在屏幕左右两侧向上发射粒子。上一节，我们放烟花时也发射了粒子，这里可以继续复用上节课粒子相关代码。上一节我们绘制的是圆形，这节课通过最终效果来看绘制的是椭圆。

首先我们先抽象出一个 `Confetti` 类，该类控制展示五彩纸屑，它拥有一个核心方法就是 `show`。有了 `Confetti` 类我们还需要渲染每一个例子，当然需要一个 `Particle` 类，该类似于烟花的粒子，我们抄一抄就行。当每次调用 `confetti.show()` 的时候需要创建一堆纸屑粒子，纸屑粒子朝着特定的方向发射，后面随着重力落下，整体流程差不多就是这样。这里考虑到一次创建上百个粒子直接由 `Confetti` 类来管理，`Confetti` 类做的事情稍微有点多，所以我们再抽象出一层，一般的粒子效果把这一层叫发射器 `Emitter`；出于业务考虑，我们这里就抽象出批次这么个概念，每次发生一批粒子，用 `ConfettiBatch` 类来表示。`Confetti` 类每次创建一批粒子，它可能同时渲染好几批粒子，而每一批粒子，又分别由左右两个部分，每一部分又有好多纸屑粒子，一个简易的类图原型我们就有了。当然这里我们还有一些没有考虑进去的地方，如动画主循环等，不过不影响我们在此基础上进行开发。

![类图](3.png)

## Particle 类 ##

我们先从 `Particle` 类开始，它的代码跟上次的烟花的粒子几乎是一样的：

```JavaScript
class Particle {
  constructor(context, options = {}) {
    this.context = context
    this.x = options.x || 0
    this.y = options.y || 0
    this.vx = options.vx || 0
    this.vy = options.vy || 0
    this.ax = options.ax || 0
    this.ay = options.ay || 0
    this.radius = options.radius || 6
    this.radiusX = this.radius
    this.radiusY = this.radius
    this.rotation = options.rotation || 0;
    this.hColor = options.hColor ?? 180
  }

  update() {
    this.vx += this.ax
    this.vy += this.ay
    this.x += this.vx
    this.y += this.vy
  }

  draw() {
    this.context.save()
    this.context.beginPath()
    this.context.fillStyle = `hsl(${this.hColor} 100% 50%)`
    this.context.ellipse(this.x, this.y, this.radiusX, this.radiusY, this.rotation, 0, 2 * Math.PI)
    this.context.closePath()
    this.context.fill()
    this.context.restore()
  }

}
```

`Particle` 类的核心逻辑是通过 `this.context.ellipse()` 方法绘制了一个椭圆。五彩纸屑粒子相比于烟花粒子多了一个 `rotation` 属性，用来控制粒子旋转的角度。`radius` 属性表示椭圆的半径，这里我们把它又拆分成 `radiusX` 和 `radiusY` 分别是椭圆 `X轴` 和 `Y轴` 的半径，当两者相同的时候椭圆就是一个圆形，后面我们通过修改 `radiusX` 和 `radiusY` 来显示椭圆。


## ConfettiBatch 类 ##

`ConfettiBatch` 类用来处理一批粒子，包括左右两部分粒子。代码如下：

```JavaScript
class ConfettiBatch {

  particles = []

  constructor(context, options = {}) {
    this.context = context;
    const number = options.number || 80;
    const radius = options.radius || 6;
    const canvasWidth = options.canvasWidth || 300;
    const canvasHeight = options.canvasHeight || 150;

    const leftParticles = new Array(number).fill(0).map(() => {
      const speed = random(8, 14)
      const angle = random(15, 82) * Math.PI / 180
      const absCos = Math.abs(Math.cos(angle))
      const absSin = Math.abs(Math.sin(angle))
      return new Particle(this.context, {
        x: -radius,
        y: canvasHeight * 5 / 7,
        vx: speed * absCos,
        vy: -speed * absSin,
        ax: 0,
        ay: 0.2,
        radius: radius,
        rotation: random(0, 0.2),
        hColor: Math.floor(random(360))
      })
    })

    const rightParticles = new Array(number).fill(0).map(() => {
      const speed = random(8, 14)
      const angle = random(15, 82) * Math.PI / 180
      const absCos = Math.abs(Math.cos(angle))
      const absSin = Math.abs(Math.sin(angle))
      return new Particle(this.context, {
        x: canvasWidth + radius,
        y: canvasHeight * 5 / 7,
        vx: -speed * absCos,
        vy: -speed * absSin,
        ax: 0,
        ay: 0.2,
        radius: radius,
        rotation: random(-0, 2, 0),
        hColor: Math.floor(random(360))
      })
    })

    this.particles = leftParticles.concat(rightParticles)
  }

  update() {
    this.particles.forEach(particle => {
      particle.update()
    })
  }

  draw() {
    this.particles.forEach(particle => {
      particle.draw()
    })
  }
  
}
```

`ConfettiBatch` 类中我们创建了2个数组 `leftParticles` 和 `rightParticles` 分别表示左右两部分粒子，每一个数组默认有80个粒子。我们生成粒子的速度是 `8 ~ 12px` 的随机数，角度是 `15 ~ 82°`。由于左侧的粒子是朝右上角发射的，而右边的粒子是从左上角发射的，所以左侧粒子的 `vx` 的值是正数，右侧粒子的 `vx` 的值是负数。两者都是向上发射的，所以 `vy` 都是负数（`Canvas` y轴向下）。最后我们把两部分粒子放在 `particles` 数组中，以方便在更新和绘制的时候，一个循环就搞定了。

## Confetti 类 ##

`Confetti` 类核心方法是 `show()` 方法，该方法用来创建一批粒子并启动动画循环。此外我们还添加 `clear()` 方法用来清空渲染的批次，`destroy()` 方法用来销毁 `Canvas`，代码如下：

```JavaScript
class Confetti {
  batches = []

  constructor(options = {}) {
    this.canvas = options.canvas || createCanvas()
    this.context = this.canvas.getContext('2d')
  }

  show(showOptions = {}) {
    const canvasRect = this.canvas.getBoundingClientRect()
    const canvasWidth = canvasRect.width
    const canvasHeight = canvasRect.height

    const batch = new ConfettiBatch(this.context, {
      number: showOptions.number,
      radius: showOptions.radius,
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight,
    })
    this.batches.push(batch)
    this.loop()
  }

  update() {
    this.batches.forEach(batch => {
      batch.update()
    })
  }

  draw() {
    this.batches.forEach(batch => {
      batch.draw()
    })
  }

  loop = () => {
    const canvasWidth = this.canvas.canvasWidth
    const canvasHeight = this.canvas.offsetHeight
    this.context.clearRect(0, 0, canvasWidth, canvasHeight)
    this.update(canvasHeight)
    this.draw()

    requestAnimationFrame(this.loop)
  }

  clear() {
    this.batches = []
  }

  destroy() {
    this.clear()
    this.canvas.remove()
  }
}

const confetti = new Confetti()
confetti.show()
```

`Confetti` 类构造函数的参数中需要传一个 `canvas`，用来告诉我们需要绘制在哪里，但是更多时候我们需要绘制的是整个屏幕，此时就不需要再传 `canvas` 了，这里通过 `createCanvas()` 方法来创建一个全屏的不可交互的 `canvas`, 具体代码如下：

```JavaScript
function createCanvas() {
  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.zIndex = '1000'
  canvas.style.pointerEvents = 'none'
  document.body.appendChild(canvas)
  return canvas
}
```

此时，你兴高采烈的运行代码，结果发现屏幕上什么都没有！到底发生什么事了？我们的代码哪里有 BUG ？我们看看 `createCanvas()` 方法，该方法通过CSS修改了 `canvas` 的大小，但是 `canvas` 高度实际上是默认的 `300px * 150px`，因为上面并没有通过 HTML 或者 JS 的方式设置宽高，原来问题出在这里。现在我们修复这个 BUG，让每次绘制的时候都将 `canvas` 的宽高设置成真实显示的 `Canvas` 宽高，具体代码如下： 

```JavaScript
function normalizeComputedStyleValue(string) {
  return +string.replace(/px/, '')
}

function fixWidthAndHeight(canvas) {
  const computedStyles = getComputedStyle(canvas)

  const width = normalizeComputedStyleValue(computedStyles.getPropertyValue('width'))
  const height = normalizeComputedStyleValue(computedStyles.getPropertyValue('height'))

  canvas.setAttribute('width', width)
  canvas.setAttribute('height', height)
}

class Confetti {
  // ... 其他代码相同
  loop = () => {
    // 设置当前宽高为显示的宽高
    fixWidthAndHeight(this.canvas)

    // 这里获取到的是真实的宽高
    const canvasWidth = this.canvas.canvasWidth
    const canvasHeight = this.canvas.offsetHeight
    this.context.clearRect(0, 0, canvasWidth, canvasHeight)
    this.update(canvasHeight)
    this.draw()

    requestAnimationFrame(this.loop)
  }
  // ... 其他代码相同
}
```

这里也可以考虑通过 `devicePixelRatio` 来根据设备像素比进行对 `Canvas` 缩放以保证更清晰的显示效果，由于我们这的文章主要内容是绘制五彩纸屑的思想，为了使代码更易懂就不考虑设备像素比了。由于我们在每次循环中都把 `Canvas` 的宽高设置为实际显示的宽高，所以这里也不需要像烟花的代码一样监听 `resize` 来处理视口的变化。

现在的[效果如下](https://canvas-demo.kai666666.com/19/01.html)：

![首轮效果](4.gif)

## 3D旋转粒子 ##

上面效果还是比较生硬的，没有纸片翻转的感觉。正常3D翻转如下，可用[CSS轻松实现](https://canvas-demo.kai666666.com/19/02.html)。

![3D旋转](5.gif)

我们这里每一个粒子都需要像上面这样旋转，对于单个粒子（圆）来说，在3D旋转过程中半径是不变的，角度可以看成是线性变化的，所以高度可以通过三角函数来 `r * cos(θ)` 来计算。不过这里有一种更简单的做法来近似计算，就是线性修改椭圆的高度。虽然效果上来说并不是真正的3D旋转，但在较小的粒子上跟真实的3D旋转效果差距不大，而且计算量更小，所以我们这里通过线性修改 `radiusY` 的值来近似模拟粒子3D旋转效果。

`Particle` 类我们新增了2个参数 `radiusYSpeed` 和 `rotationSpeed` 分别表示y轴半径变化的速度和，圆形旋转的速度，同时还新增了一个 `radiusYDirection` 属性（可选值`down`、`up`），用来表示当前y轴半径变化的方向，当值为 `down` 的时候，表示圆的Y轴半径变小；当值为 `up` 的时候，表示圆的Y轴半径变大。在 `update` 方法中我们通过 `radiusYDirection` 来修改 `radiusY` 的值，如果是 `down` 的时候，`radiusY` 每次减去它的速度直到小于0后反向，同样的当值为 `up` 的时候，`radiusY` 每次加上它的速度直到大于圆的半径后反向。如下：

```JavaScript
class Particle {
  constructor(context, options = {}) {
    // ... 其他代码相同
    this.rotationSpeed = options.rotationSpeed || 0;
    this.radiusYSpeed = options.radiusYSpeed || 0;
    this.radiusYDirection = 'down'
  }

  update() {
    this.vx += this.ax
    this.vy += this.ay
    this.x += this.vx
    this.y += this.vy

    if (this.radiusYDirection === 'down') {
      this.radiusY -= this.radiusYSpeed;
      if (this.radiusY < 0) {
        this.radiusY = -this.radiusY
        this.radiusYDirection = 'up'
      }
    } else {
      this.radiusY += this.radiusYSpeed;
      if (this.radiusY > this.radius) {
        this.radiusY = this.radius - (this.radiusY - this.radius)
        this.radiusYDirection = 'down'
      }
    }
    this.rotation += this.rotationSpeed
  }

  // 其他代码相同
}
```

`ConfettiBatch` 类在创建粒子的时候也需要传递新增的参数。

```JavaScript
new Particle(this.context, {
  // ... 其他代码相同
  radiusYSpeed: random(0.5, 1.2),
  rotationSpeed: 0.2,
})
```

此时的效果已经很OK了，[如下](https://canvas-demo.kai666666.com/19/03.html)：

![第二版效果](6.gif)

## 清除已完成的粒子 ##

上面粒子离开屏幕后我们并没有清除已完成的粒子，这样会造成性能下降，如果多调用几次 `confetti.show()` 将会越来越卡。现在我们需要清除已完成的粒子。

首先 `Particle` 添加一个 `isDone()` 方法，用来判断是否完成，这里认为超出 `Canvas` 高度 `100px` 后粒子就完成了自己的使命。

```JavaScript
class Particle {
  // ... 其他代码相同
  isDone(canvasHeight) {
    return this.y > canvasHeight + 100 // 超出canvas高度100像素任务已完成
  }
}
```

然后在 `ConfettiBatch` 类中添加了 `clearDone()` 和 `isDone()` 方法。`clearDone()` 用来清除已经绘制完的粒子，本质就是通过 `particles.filter` 方法过滤掉已完成的粒子。这里需要传递 `canvasHeight`，是因为每一帧 `canvasHeight` 都可能会不同。`isDone()` 方法也比较简单，如果粒子都被清空则表示该批次已经完成自己的使命。

```JavaScript
class ConfettiBatch {
  // ... 其他代码相同

  clearDone(canvasHeight) {
    this.particles = this.particles.filter(particle => {
      return !particle.isDone(canvasHeight)
    })
  }

  isDone() {
    return !this.particles.length
  }
}
```

最后在 `Confetti` 类中，也需要清理对应的批次，一个批次的粒子有挺多的，清空这一批次实际上是低概率的事情，我们没必要每一帧都去检测是否需要清空当前批次（当然如果每一帧去检测也可以），这里我们每10帧检测一次。代码如下：

```JavaScript
class Confetti {
  batches = []
  // 用来记录迭代次数
  iterationIndex = 0
  // ... 其他代码相同

  clearDone(canvasHeight) {
    this.batches = this.batches.filter(batch => {
      batch.clearDone(canvasHeight)
      return !batch.isDone()
    })
  }

  loop = () => {
    fixWidthAndHeight(this.canvas)
    // 每10帧重新开始记录
    this.iterationIndex = (++this.iterationIndex) % 10
    const isClear = this.iterationIndex === 0
    const canvasWidth = this.canvas.canvasWidth
    const canvasHeight = this.canvas.offsetHeight
    this.context.clearRect(0, 0, canvasWidth, canvasHeight)
    this.update(canvasHeight)
    this.draw()
    if (isClear) {
      this.clearDone(canvasHeight)
    }

    requestAnimationFrame(this.loop)
  }
}
```

此时的效果跟上面一样，可以[点击这里查看](https://canvas-demo.kai666666.com/19/04.html)。

## 主循环优化 ##

我们之前的代码在调用 `confetti.show()` 的时候开启主循环，如果多次调用 `confetti.show()` 就会开启多个主循环，这肯定是不行的。现在我们处理一下这个问题。我们新增一个 `isRunning` 属性来标记是否开启主循环，`confetti.show()` 的时候如果没开启则开始主循环，否则说明主循环已经处于开启状态，就没必要再多次开启。另外当所有的批次都结束后应该关闭主循环，代码如下：

```JavaScript
class Confetti {
  // ... 其他代码相同
  isRunning = false

  // ... 其他代码相同

  show(showOptions = {}) {
    // ... 其他代码相同
    if (!this.isRunning) {
      this.run()
    }
  }

  // ... 其他代码相同

  run() {
    this.isRunning = true
    this.loop()
  }

  loop = () => {
    // ... 其他代码相同

    // batches有长度的时候需要循环 没有长度的时候则不再循环
    if (this.batches.length) {
      requestAnimationFrame(this.loop)
    } else {
      this.isRunning = false
    }
  }

  // ... 其他代码相同
}

```

现在我们的五彩纸屑效果就完成了，具体效果可以[点击这里](https://canvas-demo.kai666666.com/19/05.html)。

----

今天的课程到这里就结束了，当然我们的五彩纸屑还可以添加更多的功能，比如添加一些方形的五彩纸屑，也添加一些 `emoji`；另外我们的水平速度和垂直速度都应该根据视口的宽高来生成，而不是直接给一个随机值。我相信通过本章的学习，聪明的你一定可以自己实现更好的效果。加油吧少年，愿你的生活能像五彩碎屑一样多姿多彩！! 😜