---
title: Chrome的小恐龙游戏自动躲避障碍物
date: 2020-01-07 13:48:00
tag:
	- 小技巧
categories: JavaScript
---

最近在掘金上看了一篇文章，名叫[《Chrome 的小恐龙游戏，被我破解了...》](https://juejin.im/post/5e0f3bb75188253a7f15b22e)，文章中说的是只要在控制台输入`Runner.prototype.gameOver=()=>{}`小恐龙就可以不用死了，如果在控制台输入`Runner.instance_.setSpeed(100)`就可以改变小恐龙的速度，从而实现小恐龙快速移动而不死的效果。这篇文章还是挺有意思的，我们先来研究一下这个游戏吧。

----

## 小恐龙游戏玩法 ##

`Chrome`在离线状态（拔网线、断开WIFI等）下打开任意网页就会出现小恐龙（实际上是霸王龙）的游戏。游戏中可以使用空格（或者上键）控制小恐龙跳跃，下键控制小恐龙匍匐前行，其实这个游戏只要用空格键就可以躲避所有的障碍物，本博客也不考虑使用下键。游戏的规则很简单，就是尽可能地躲避障碍物使其跑的更远，从而实现更高的分数。由于这完全是一个单机的`canvas`游戏，你可以直接修改距离，比如控制台输入`Runner.instance_.distanceRan = 999999`，距离就变了，分数也跟着变了。当然这样得高分就没意思了，我们还是希望让小恐龙自己去跳跃，靠恐龙自己来得高分。

![小恐龙游戏](1.png)

## JS触发键盘事件 ##

要像让小恐龙自动跳跃，肯定需要用JS模拟按空格键，当然直接调用小恐龙的跳跃方法也可以，由于按下空格键后不仅仅是跳跃（还有播放声音等其他逻辑），所以我们就使用JS来模拟按键事件。
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

小恐龙的源码在`head`标签的最后一个`script`里面；你也可以在控制台输入`Runner`回车后双击内容，可以看到浏览器的Source标签弹出了小恐龙的代码，你可以把内容拷贝到一个js文件里以方便查看。

![代码](2.png)

通过源码分析我们可以知道：

> 游戏控制器函数（游戏控制器类）：Runner
> 游戏控制器对象（使用了单例模式）：Runner.instance_
> 障碍物：Runner.instance_.horizon.obstacles
> 小恐龙：Runner.instance_.tRex
> 当前水平速度：Runner.instance_.currentSpeed
> 每一帧的更新函数：Runner.prototype.update

总的来说，游戏会调用`requestAnimationFrame`来绘制和更新，其中绘制和更新游戏的逻辑在`Runner.prototype.update`中。我们只要修改`Runner.prototype.update`函数，当恐龙距离它前面障碍物到达一定的距离就模拟按下空格键。然后来一招移魂大法重写`Runner.prototype.update`函数就可以了，具体如下：

```JavaScript
(function (){
  var __update = Runner.prototype.update;
  var JUMPMINTIME = 18;

  Runner.prototype.update = function (){
    var tRex = Runner.instance_.tRex;
    var obstacles =  Runner.instance_.horizon.obstacles;
    var index = 0;
    while(index < obstacles.length){
      var xDistance = obstacles[index].xPos - tRex.xPos;
      if(xDistance > 0){
        if (!tRex.jumping && xDistance / Runner.instance_.currentSpeed < JUMPMINTIME) {
          var event =  new KeyboardEvent('keydown',{ code:'Space', keyCode:32, key: " " });
          document.dispatchEvent(event);
        }
        break;
      } else {
        index ++;
      }
    }
    __update.call(this)
  }
})()
```

上述代码中使用了自执行函数，为了避免污染全局变量。变量`JUMPMINTIME`的值`18`完全是一个经验值，试了几次这个值还是比较准确的，当然可能不是最优的，你可以调一调。现在拷贝上述代码到浏览器控制台并按回车键试试看吧。
