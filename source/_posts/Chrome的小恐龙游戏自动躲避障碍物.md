---
title: Chrome的小恐龙游戏自动躲避障碍物
date: 2020-01-07 13:48:00
tag:
	- 小技巧
categories: JavaScript
---

年初一篇名叫[《Chrome 的小恐龙游戏，被我破解了...》](https://juejin.im/post/5e0f3bb75188253a7f15b22e)的文章在掘金上火了一把，文章中说的是如果在控制台输入`Runner.instance_.setSpeed(100)`就可以改变小恐龙的速度；如果在控制台输入`Runner.prototype.gameOver=()=>{}`，小恐龙就可以不用死了，就这样小恐龙可以快速移动且不死，那分当然是刷刷刷地涨起来了！这篇文章还是挺有意思的，我们先来研究一下这个游戏吧。

----

## 小恐龙游戏玩法 ##

`Chrome`在离线状态（拔网线、断开WIFI等）下打开任意网页就会出现小恐龙（实际上是霸王龙）的游戏。游戏中可以使用空格（或者上键）控制小恐龙跳跃，下键控制小恐龙匍匐前行，其实这个游戏只要用空格键就可以躲避所有的障碍物，本博客也不考虑使用下键的情况。游戏的规则很简单，就是尽可能地躲避更多的障碍物，从而达到更高的分数。由于这完全是一个单机的`canvas`游戏，你可以直接修改距离，比如控制台输入`Runner.instance_.distanceRan = 999999`，距离就变了，分数也跟着变了。当然这样得高分就没意思了，我们还是希望让小恐龙自己去跳跃，靠小恐龙自己的努力来得高分。

![小恐龙游戏](1.png)

## JS触发键盘事件 ##

要想让小恐龙自动跳跃，肯定需要用JS来模拟按空格键，当然直接调用小恐龙的跳跃方法也是可以的。由于使用空格键后不仅仅是跳跃，还有播放声音等其他逻辑，所以我们就使用JS来模拟按空格键的事件来让小恐龙去跳跃。
JS模拟键盘按下事件很简单，可以直接使用`KeyboardEvent`对象，如下：

```JavaScript
// 监听事件
document.addEventListener('keydown',function (e){
  console.log(e);
})
// 模拟触发按下空格事件
var event =  new KeyboardEvent('keydown',{ code:'Space', keyCode:32, key: " " });
document.dispatchEvent(event);
```

`KeyboardEvent`的更多内容请看[这里](https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent)。

## 实现小恐龙自己跳跃躲避障碍物 ##

小恐龙的源码在`head`标签的最后一个`script`里面；你也可以在控制台输入`Runner`回车后双击内容，也可以看浏览器的Source标签弹出了小恐龙的代码。如果Source标签不方便的话，你也可以把内容拷贝到一个js文件中查看。

![代码](2.png)

通过源码分析我们可以知道：

> 游戏控制器函数（游戏控制器类）：Runner
> 游戏控制器对象（使用了单例模式）：Runner.instance_
> 障碍物：Runner.instance_.horizon.obstacles
> 小恐龙：Runner.instance_.tRex
> 当前水平速度：Runner.instance_.currentSpeed
> 每一帧的更新函数：Runner.prototype.update

总的来说，游戏会调用`requestAnimationFrame`来绘制和更新，其中绘制和更新游戏的逻辑在`Runner.prototype.update`中。我们只要修改`Runner.prototype.update`函数，当恐龙距离它前面障碍物除以当前小恐龙的速度刚好等于小恐龙跳到最好处所需要的时间时，就模拟按下空格键。总的来说就是一招移魂大法重写`Runner.prototype.update`函数就可以了，具体如下：

```JavaScript
(function (){
  var __update = Runner.prototype.update;
  var JUMPMINTIME = 18;

  // 跳跃
  function jump() {
    var event =  new KeyboardEvent('keydown',{ code:'Space', keyCode:32, key: " " });
    document.dispatchEvent(event);
  }

  Runner.prototype.update = function (){
    // 没有起跳的时候才去判断是否触发跳跃
    var tRex = Runner.instance_.tRex;
    if(!tRex.jumping) {
      var obstacles =  Runner.instance_.horizon.obstacles;
      var index = 0;
      while(index < obstacles.length){
        var xDistance = obstacles[index].xPos - tRex.xPos;
        // 找到小恐龙前面的障碍物
        if(xDistance > 0){
          // 当小恐龙可以跳过去的时候
          if (xDistance / Runner.instance_.currentSpeed < JUMPMINTIME) {
           jump();
          }
          break;
        } else {
          index ++;
        }
      }
    }
    __update.call(this)
  }

  // 开始游戏
  jump();
})()
```

为了避免污染全局变量，上述代码中使用了自执行函数。变量`JUMPMINTIME`的值`18`完全是一个经验值，试了几次这个值还是比较准确的，当然可能不是最优的，理论上需要计算小恐龙到最高处所需要的时间，然后还得处理单位，由于计算过程比较复杂，我就直接试这调了下，发现这个值还是比较靠谱的，就没有再去计算了。

上述代码还有一个问题就是当两个障碍物很近的时候，小恐龙还是可能会撞到后面的障碍物，这种情况就得提前触发起跳了，由于这种状况并不多，所以这里我们就不考虑了。

现在拷贝上述代码到浏览器控制台并按回车键开始游戏吧。
