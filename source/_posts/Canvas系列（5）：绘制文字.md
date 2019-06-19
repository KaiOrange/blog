---
title: Canvas系列（5）：绘制文字
date: 2019-06-19 09:41:08
author: Orange
tag:
	- Canvas
categories: Canvas
---

通过前面的学习，我们已经可以绘制简单的图形了。这篇文章主要讲的是，canvas绘制文字，那我们开始吧。

----

## 绘制文字 ##

绘制文字的API和之前的差不多，也是分为`stroke`和`fill`，一个是描边文字，一个是填充文字，具体API如下，是不是和`strokeRect`和`fillRect`挺类似的：

```JavaScript
// 描边文字，其实就是镂空字体喽
// 参数中 text是写什么文字 (x, y)决定了写的位置
// maxWidth给了一个最大的宽度 是非必填的 如果填了并且超出了则会缩放宽度（注意不是换行）
context.strokeText(text, x, y, maxWidth);

// 填充文字，其实就相当于写文字喽
context.fillText(text, x, y, maxWidth);
```

随便给一个例子：

```JavaScript
// 设置字体大小，为了看的更清楚
context.font='30px 微软雅黑';
// 描边
context.strokeText("这里是strokeText", 20, 40);
// 填充
context.fillText("这里是fillText", 20, 80);
// 带有最大宽度的填充
context.fillText("这里是fillText", 20, 120,100);
```

出来的效果如下：

![绘制文字](1.jpeg)

CSS是如何实现镂空字的呢？请看[这篇文章](/2019/03/19/CSS3实现彩色炫酷文字/#more)。

## measureText ##

有的时候我们需要让文字水平居中，而上面你也看到了，绘制文字传递的参数x和y是基于左上角的坐标来绘制的（默认情况下），这就需要计算一下文字的宽度，`measureText`就是用来干这事的。他返回一个`TextMetrics`对象，什么，没听过这个对象？完全没关系，这个对象很简单，名字你可以不用记，但你要记得该对象的一个特征就好了，那就是这个对象只有一个属性，连方法都没有，这个属性就是`width`。API如下：

```JavaScript
// 传入文本返回一个带有width的对象，width表示文本的宽度
context.measureText(text);
```

给一个文本居中的例子：

```JavaScript
context.font='30px 微软雅黑';
var text = "文本水平居中";
// 居中的x坐标是：( canvas.width - context.measureText(text).width ) / 2
context.fillText(text, ( canvas.width - context.measureText(text).width ) / 2, 80);
```

上面`canvas`就是canvas标签的dom元素，然后水平的x需要计算一下，y这里就随便给了一个80px。效果如下：

![文本居中](2.jpeg)

## font属性 ##

接下来我们说一下文字相关的一些属性，上面说了一个`font`属性，`font`属性的语法和CSS中font属性的语法是一样的，你有没有发现canvas和CSS有好多地方都是想通的，具体API如下：

```JavaScript
context.font='<font-style> <font-variant> <font-weight> <font-size / line-height> <font-family>';
```

其中`font-style`的值有`normal`，`italic`（斜体，使用斜体文字倾斜），`oblique`（斜体，将正常的文字通过算法倾斜，因此没有斜体字体的属性也可以倾斜）。
`font-variant`的值有`normal`，`small-caps`。
`font-weight`的值有`normal`，`bold`，`bolder`，`lighter`，`100~900`（100到900的值）。
我们修改一下上面例子中的font属性，如下：

```JavaScript
context.font='italic bold 30px 微软雅黑';
```

效果如下：

![font属性](3.jpeg)

## textAlign属性 ##

`textAlign`属性表示文字的对齐方式，它的可选值有：`start`，`end`，`center`，`left`，`right`。这五个，其中`start`和`left`很像，`end`和`right`也很像，一般情况下他们基本上是一样的效果，但是有的国家的文字并不是从左往右写的，而是从右往左写，就像我国古代一样，这个时候`start`就相当于`right`了。换句话说`start`和`end`会检测文本顺序是`ltr`(left to right)还是`rtl`(right to left)，你可以给DOM元素加一个属性`direction=“rtl”`然后看看效果。由于现在我国和大多数的国家都是`ltr`，所以这里就不对这两个属性做详细的描述了，现在给一个另一种让文字水平居中的方法：

```JavaScript
context.font='30px 微软雅黑';
var text = "文本水平居中";
// 设置文本居中
context.textAlign='center';
// 然后在画布水平的中间位置绘制文字
context.fillText(text, canvas.width / 2, 80);
```

效果如下：

![textAlign属性居中](4.jpeg)

## textBaseline属性 ##

`textBaseline`属性描述了文本基线的位置。他的值有：`alphabetic`（默认，使用字母表的基线），`top`，`hanging`（悬挂基线），`middle`，`ideographic`（表意基线），`bottom`。

这里给一个文字水平垂直居中的例子：

```JavaScript
context.font='30px 微软雅黑';
var text = "文本水平垂直居中";
context.textAlign='center';
context.textBaseline='middle';
context.fillText(text, canvas.width / 2, canvas.height / 2);
```

效果如下：

![水平垂直居中](5.jpeg)
