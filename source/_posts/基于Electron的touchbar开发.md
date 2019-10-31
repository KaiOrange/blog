---
title: 基于Electron的touchbar开发
date: 2019-09-21 13:31:35
author: Orange
tags:
  - JavaScript
  - Electron
categories: JavaScript
---

[Electron](https://electronjs.org/)是`使用 JavaScript, HTML 和 CSS 构建跨平台的桌面应用`的一个框架，本人之前写的一个放烟花的程序[fireworks-cool](https://github.com/KaiOrange/fireworks-cool)就是基于这套框架来做的。electron在跨平台应用方面做的还是挺好的，著名的编辑器`VS Code`与`Atom`都是使用`Electron`来开发的。有了`Node`，前端工程师可以直接干后端的事了；有了`Electron`，前端工程师可以直接干桌面应用工程师的事了。昨天研究这个`touchbar`，真心感觉到了`JavaScript`的无所不能属性，明天我们开发一个操作系统😊。
吹了这么多`Electron`，我们再说说`touchbar`吧。我觉得`touchbar`是`Mac`上一个鸡肋的功能，我在使用`Mac`的时候很少去关注`touchbar`。昨天忽然想到`Electron`可以开发桌面应用，那么是否可以做`touchbar`相关的功能呢？于是看了下它的官方文档，发现确实是可以开发`touchbar`相关的功能，不过目前`Electron`的`touchbar`还是**实验性的API**，后续有可能更改也有可能去掉，不过并不影响我们先玩玩它。玩玩它后，你会发现鸡肋的`touchbar`还是有点意思的。当然`touchbar`是`Mac`特有的硬件，如果不是`Mac`的小伙伴就体验不了本章的内容了。

---

### 运行官方的例子 ###

官方给了一个老虎机的一个例子，这个例子还是很有趣的，感兴趣的可以直接[点击这里](https://electronjs.org/docs/api/touch-bar#touchbarescapeitem)查看。如果连接打不开，可以直接看下面的代码，我已经帮你拷贝好了：

```JavaScript
const { app, BrowserWindow, TouchBar } = require('electron')

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar

let spinning = false

// Reel labels
const reel1 = new TouchBarLabel()
const reel2 = new TouchBarLabel()
const reel3 = new TouchBarLabel()

// Spin result label
const result = new TouchBarLabel()

// Spin button
const spin = new TouchBarButton({
  label: '🎰 Spin',
  backgroundColor: '#7851A9',
  click: () => {
    // Ignore clicks if already spinning
    if (spinning) {
      return
    }

    spinning = true
    result.label = ''

    let timeout = 10
    const spinLength = 4 * 1000 // 4 seconds
    const startTime = Date.now()

    const spinReels = () => {
      updateReels()

      if ((Date.now() - startTime) >= spinLength) {
        finishSpin()
      } else {
        // Slow down a bit on each spin
        timeout *= 1.1
        setTimeout(spinReels, timeout)
      }
    }

    spinReels()
  }
})

const getRandomValue = () => {
  const values = ['🍒', '💎', '7️⃣', '🍊', '🔔', '⭐', '🍇', '🍀']
  return values[Math.floor(Math.random() * values.length)]
}

const updateReels = () => {
  reel1.label = getRandomValue()
  reel2.label = getRandomValue()
  reel3.label = getRandomValue()
}

const finishSpin = () => {
  const uniqueValues = new Set([reel1.label, reel2.label, reel3.label]).size
  if (uniqueValues === 1) {
    // All 3 values are the same
    result.label = '💰 Jackpot!'
    result.textColor = '#FDFF00'
  } else if (uniqueValues === 2) {
    // 2 values are the same
    result.label = '😍 Winner!'
    result.textColor = '#FDFF00'
  } else {
    // No values are the same
    result.label = '🙁 Spin Again'
    result.textColor = null
  }
  spinning = false
}

const touchBar = new TouchBar({
  items: [
    spin,
    new TouchBarSpacer({ size: 'large' }),
    reel1,
    new TouchBarSpacer({ size: 'small' }),
    reel2,
    new TouchBarSpacer({ size: 'small' }),
    reel3,
    new TouchBarSpacer({ size: 'large' }),
    result
  ]
})

let window

app.once('ready', () => {
  window = new BrowserWindow({
    frame: false,
    titleBarStyle: 'hiddenInset',
    width: 200,
    height: 200,
    backgroundColor: '#000'
  })
  window.loadURL('about:blank')
  window.setTouchBar(touchBar)
})
```

运行上面的代码：

1. 建立一个文件夹，比如`touchbar-demo`，再创建一个文件`touchbar.js`，将上面的代码拷贝进去。
2. 当前目录下，在命令行输入下面的内容来安装`Electron`。

    > ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/ npm install electron

3. 命令行执行下面内容以启动：

    > ./node_modules/.bin/electron touchbar.js

你可以看到我们安装`Electron`的时候加了一个`ELECTRON_MIRROR`的参数，为什么要带这个参数呢？其实在`npm install electron`的时候会下载`electron`依赖，这个依赖有一个`postinstall`的脚本，该脚本会继续从`github`下载当前平台的`Electron`应用程序，由于国内对国外网站的限制，虽然`github`是可以访问的，但是网速不咋样。所以直接访问的话往往会有下载失败的问题（即使npm的源切换到taobao也经常出现问题，因为下载`Electron`应用程序是走`github`的下载地址的，下载地址具体请看[这里](https://github.com/electron/electron/releases)）。

通过上述三个步骤，实例代码基本上可以跑通了，大概效果如下，是不是很有意思呢？

![运行官方示例](1.gif)

### 组件 ###

通过上面的代码我们可以看到，通过`new TouchBar()`创建了一个TouchBar的实例，然后调用`BrowserWindow`对象的`setTouchBar()`方法就可以了，`TouchBar`的构造方法的参数是一个对象，这个对象可选字段有2个，一个是`items`，另一个是`escapeItem`。`items`是一个数组，用来添加`touchbar`中间部分的组件。`escapeItem`是单个的一个组件，用来替换`touchbar`左侧的`esc`按钮。
现在我们新建一个`index.js`，运行下面代码（命令行输入`./node_modules/.bin/electron index.js`），看看效果：

```JavaScript
const { app, BrowserWindow, TouchBar } = require('electron')

const { TouchBarLabel, TouchBarButton } = TouchBar

const touchBar = new TouchBar({
  items: [
    new TouchBarButton({
      label: '😇',
    }),
    new TouchBarButton({
      label: '😁',
      backgroundColor: '#ff0000'
    }),
    new TouchBarButton({
      label: '🤣',
      backgroundColor: '#00ff00'
    }),
    new TouchBarButton({
      label: '😂',
      backgroundColor: '#0000ff'
    }),
    new TouchBarLabel({
      label: 'TouchBarLabel就是文字',
      textColor: '#AACCEE'
    })
  ],
  escapeItem: new TouchBarButton({
    label: '这里原本是退出键',
    icon: './img.jpeg',
    iconPosition: 'left',
    click:()=>{
      console.log('点了也不会退出的！因为我就没写退出的事件');
    }
  })
})

let window

app.once('ready', () => {
  window = new BrowserWindow({
    frame: false,
    titleBarStyle: 'hiddenInset',
    width: 200,
    height: 200,
    backgroundColor: '#000'
  })
  window.loadURL('about:blank')
  window.setTouchBar(touchBar)
})
```

运行结果如下：

![items与escapeItem](2.png)

代码中第29行的图标点击[这里下载](img.jpeg)。

上面使用了2个组件，一个是`TouchBarButton`，代表的是一个按钮，另一个是`TouchBarLabel`，代表的是一个简单的标签。需要注意的是`TouchBarLabel`只是单纯的文字，不支持点击事件（当然你使用的时候有可能API已经支持了），它的参数也很简单，就是上面例子中的那2个，`TouchBarButton`是支持点击事件的，如上面`escapeItem`中的click方法。

`Electron`所支持的所有组件（写本章的时候）有：

1. [TouchBarButton](https://electronjs.org/docs/api/touch-bar-button)
2. [TouchBarLabel](https://electronjs.org/docs/api/touch-bar-label)
3. [TouchBarColorPicker](https://electronjs.org/docs/api/touch-bar-color-picker)
4. [TouchBarGroup](https://electronjs.org/docs/api/touch-bar-group)
5. [TouchBarPopover](https://electronjs.org/docs/api/touch-bar-popover)
6. [TouchBarScrubber](https://electronjs.org/docs/api/touch-bar-scrubber)
7. [TouchBarSegmentedControl](https://electronjs.org/docs/api/touch-bar-segmented-control)
8. [TouchBarSlider](https://electronjs.org/docs/api/touch-bar-slider)
9. [TouchBarSpacer](https://electronjs.org/docs/api/touch-bar-spacer)

这里给一个简单的例子展示一下其中的几个组件，剩下的你可以自己去尝试一下：

```JavaScript
const { app, BrowserWindow, TouchBar } = require('electron')

const { TouchBarColorPicker, TouchBarSpacer, TouchBarScrubber, TouchBarSegmentedControl, TouchBarSlider } = TouchBar

const touchBar = new TouchBar({
  items: [
    new TouchBarColorPicker(),
    new TouchBarSpacer({
      size: 'small'
    }),
    new TouchBarScrubber({
      items: [{label:'第一个'},{label:'第二个'}],
      selectedStyle: 'outline'
    }),
    new TouchBarSpacer({
      size: 'large'
    }),
    new TouchBarSegmentedControl({
      segments:[{label:'第一个'},{label:'第二个'}],
      mode: 'buttons'// single multiple buttons
    }),
    new TouchBarSpacer({
      size: 'flexible'
    }),
    new TouchBarSlider({
      label: '滑动组件'
    })
  ]
})

let window

app.once('ready', () => {
  window = new BrowserWindow({
    frame: false,
    titleBarStyle: 'hiddenInset',
    width: 200,
    height: 200,
    backgroundColor: '#000'
  })
  window.loadURL('about:blank')
  window.setTouchBar(touchBar)
})
```

![组件展示](3.jpg)

---

PS：学会了这个，就有了后来的一个小项目[touchbar-emoji](https://github.com/KaiOrange/touchbar-emoji)，使用touchbar来控制飘落emoji表情雨。
