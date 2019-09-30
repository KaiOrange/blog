---
title: 使用console.log在控制台打印图片
date: 2019-02-21 14:00:00
author: Orange
tags:
  - JavaScript
  - 控制台图片
categories: JavaScript
---

在项目的开发中我们经常使用`console.log`方法在控制台输出数据，看数据是否正确。`console`是全局变量`window`（或`global`）下的一个对象，它给我们提供了很多的方法，我们可以打印一下这个对象，如下：

![console对象的方法](1.png)

我们可以看到除了`log`方法以外还有`info`、`warn`、`error`等方法，类似于常用的日志系统中的不同级别。
```JavaScript
console.log("log");
console.info("info");
console.warn("warn");
console.error("error");
```
显示出来的效果在`Chrome`里面的效果如下:

![Chrome下不同级别的打印](2.png)

其中`log`和`info`的区别有点不太明显，我们在`Firefox`下再次打印可以看到`info`级别的左边有个图标:

![Firefox下不同级别的打印](3.png)

除了这几个不同级别的打印外，还有一个使用的比较多方法就是`console.table`，它可以用表格列出一个对象的属性：

![console.table用法](4.png)

最后再简绍一个可以清空控制台的一个方法就是`console.clear()`，其他的方法大家可以自己试试，还是挺有意思的。

说了这么多我们回归到最常用的`console.log()`吧，他可以打印一些数据，但是很多人不知道其实它还可以添加占位符，类似于C语言的`printf函数`，具体可以使用的占位符如下：

占位符|作用
:--:|:--:
%s|字符串
%d 或者 %i|整数
%f|浮点数
%o|可展开的DOM
%O|列出DOM的属性
%c|根据提供的css样式格式化字符串

我们试一下前三个：
```JavaScript
console.log("打印的字符串是：%s","JavaScript很简单");
console.log("打印的整数是：%d",123.456);
console.log("打印的浮点数是：%f",123.456);
```
结果如下：

![带占位符的打印](5.png)

`console.log("%o",document.body);`的结果大致如下：

![%o占位符的结果](6.png)

`console.log("%O",document.body);`的结果大致如下：

![%O占位符的结果](7.png)

所有占位符中最牛逼的当然是`%c`了，因为他可以添加样式，这样就可以美化我们的打印效果了。先来看个例子：
```JavaScript
console.log("%c神奇的console","font-size: 24px;font-style: italic;color: brown;");
```
结果如下：

![%c占位符的结果](8.png)

最后我们回归主题，打印一张图片，思路就是使用`background-image`来添加一张背景图片。这里需要要注意的是，设置背景以后要有内容，不然还是不会显示（当然也可以添加样式让内容撑开，大家可以试试）。我们这里随便写个内容就比如一个“+”，当然我们还要设置背景图片显示大小，并且让内容透明（不显示内容）。为了方便代码的阅读，样式部分我使用了ES6的模板字符串，具体代码如下：
```JavaScript
console.log("%c+",
  `font-size: 1px;
  padding: 122px 217px;
  background-image: url(http://imgsrc.baidu.com/forum/w=580/sign=780874ff6e380cd7e61ea2e59145ad14/fb20952bd40735fa2ebbc5f695510fb30e2408ea.jpg);
  background-size: contain;
  background-repeat: no-repeat;
  color: transparent;`);
```
结果如下：

![console.log打印图片](9.gif)
