---
title: 使用Node在浏览器打开某个网页
date: 2019-07-29 13:41:25
author: Orange
tags:
  - Node
categories: Node
---

使用Node在浏览器打开某个网页，其实就是使用子进程来用命令行打开网页链接就可以了，需要注意的是`Mac`系统使用的是`open`命令，`Windows`系统使用的是`start`命令，Linux等系统使用`xdg-open`命令。针对不同的操作系统使用不同的命令。

## 代码 ##

首先创建一个`index.js`文件，然后写我们的代码：

```JavaScript
const child_process = require('child_process');

var openURL = function (url) {
  // 判断平台
  switch (process.platform) {
    // Mac 使用open
    case "darwin":
      child_process.spawn('open', [url]);
      break;
    // Windows使用start
    case "win32":
      child_process.spawn('start', [url]);
      break;
    // Linux等使用xdg-open
    default:
      child_process.spawn('xdg-open', [url]);
  }
};

openURL("https://www.kai666666.top/");
```

## 运行 ##

在当前命令行运行下面命令，可以看到浏览器已经打开我们的网页了。

```Shell
node index.js
```

## 优化 ##

往往在代码中直接写死地址是不好的，我们使用传过来的参数视为打开的URL，修改`index.js`文件最后1行代码：

```diff
- openURL("https://www.kai666666.top/");
+ let url = process.argv[2];
+ if (url) {
+   openURL(url);
+ } else {
+   console.log("请输入URL");
+ }
```

上面`process.argv`是一个数组，其中0下标的数据是node的路径，1下标的数据是执行文件也就是这里的`index.js`文件的路径，2到多下标中的数据是后面传入的数据，上面我们只检查2下标的数据。

最后使用下面命令启动：

```Shell
node index.js https://www.kai666666.top/
```

## 更多 ##

看到上面这你会不会想到，自己封装一下打开网页的方法呢？其实已经有人这么做了，你可以看看[open库](https://github.com/sindresorhus/open)，它就是使用代码来打开网页的（其实不仅仅是网页），著名的webpack插件[open-browser-webpack-plugin](https://github.com/baldore/open-browser-webpack-plugin)就是使用它在启动的时候打开一个页面。当然它是需要用代码来启动的，你可能希望直接在命令行来启动，就像我们上面那样，那你可以看看open库作者的另一个库：[open-cli](https://github.com/sindresorhus/open-cli)，内部也是使用`open`库来启动的，只是封装了一层命令行传URL的过程。
