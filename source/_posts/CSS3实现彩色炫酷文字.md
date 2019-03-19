---
title: CSS3实现彩色炫酷文字
date: 2019-03-19 15:31:08
author: Orange
tag:
  - CSS效果
categories: CSS
---

我们今天要使用CSS3实现下面这样的酷酷的效果：

![彩色炫酷文字](1.gif)

----

要实现这样的效果只需要三步：
1. 设置渐变背景色；
2. 按照文字拆分背景；
3. 去掉文字本身的颜色；
4. 设置动画。

我们也按照这个步骤一步一步的写出样式，首先给出HTML结构：
```HTML
<div class="color-text">这里是彩色的文字</div>
```
然后给出初始的CSS结构:
```CSS
.color-text {
    text-align: center;
    font-size: 40px;
}
```
此时效果大概是这个样子:
![初始样式](2.png)

## 一、设置渐变背景色 ##

```CSS
.color-text {
    text-align: center;
    font-size: 40px;
    background-image: -webkit-linear-gradient(left, blue,
        #66ffff 10%, #cc00ff 20%,
        #CC00CC 30%, #CCCCFF 40%,
        #00FFFF 50%, #CCCCFF 60%,
        #CC00CC 70%, #CC00FF 80%,
        #66FFFF 90%, blue 100%);
}
```
这里需要注意一点是渐变背景色应该是按照50%对称的不然就会出现断层。这个时候的效果大概是这个样子了：
![设置渐变色](3.png)

## 二、按照文字拆分背景 ##

```CSS
.color-text {
    text-align: center;
    font-size: 40px;
    background-image: -webkit-linear-gradient(left, blue,
        #66ffff 10%, #cc00ff 20%,
        #CC00CC 30%, #CCCCFF 40%,
        #00FFFF 50%, #CCCCFF 60%,
        #CC00CC 70%, #CC00FF 80%,
        #66FFFF 90%, blue 100%);
    -webkit-background-clip: text;
}
```
此时的效果是：

![按照文字拆分背景](4.png)

咦？貌似没什么效果？其实仔细看你可以看到文字已经不是默认的那种黑色了，其实已经生效了，只是字体本身的颜色把背景色覆盖了。

## 三、去掉文字本身的颜色 ##

```CSS
.color-text {
    text-align: center;
    font-size: 40px;
    background-image: -webkit-linear-gradient(left, blue,
        #66ffff 10%, #cc00ff 20%,
        #CC00CC 30%, #CCCCFF 40%,
        #00FFFF 50%, #CCCCFF 60%,
        #CC00CC 70%, #CC00FF 80%,
        #66FFFF 90%, blue 100%);
    -webkit-background-clip: text;
    color: transparent;
}
```
去掉字体本身的颜色CSS3还有一种方法叫`text-fill-color`他可以设置文字的填充色优先级比`color`高，我们也可以使用它来代替`color: transparent;`：
```CSS
-webkit-text-fill-color: transparent;
```
此时的效果是:
![去掉文字本身的颜色](5.png)

## 四、设置动画 ##

```CSS
.color-text {
    text-align: center;
    font-size: 40px;
    /* 设置背景透明色 */
    background-image: -webkit-linear-gradient(left, blue,
        #66ffff 10%, #cc00ff 20%,
        #CC00CC 30%, #CCCCFF 40%,
        #00FFFF 50%, #CCCCFF 60%,
        #CC00CC 70%, #CC00FF 80%,
        #66FFFF 90%, blue 100%);
    /* 改变background-size是为了让动画动起来 */
    background-size: 200% 100%;
    /* 按照文字拆分背景 */
    -webkit-background-clip: text;
    /* 将字体设置成透明色 */
    -webkit-text-fill-color: transparent;
    /* 启用动画 */
    animation: masked-animation 4s linear infinite;
}

@keyframes masked-animation {
    0% {
        background-position: 0 0;
    }
    100% {
        background-position: -100% 0;
    }
}
```
通过这样设置我们就大功告成了!

## 进阶 ##
上面使用到了`text-fill-color`，我们可以在这里看看它的[兼容性](https://caniuse.com/#search=text-fill-color)。它的一大用途就是上面这样设置炫酷的彩色文字，还有一个用途就是设置镂空文字，如下。
HTML：
```HTML
<div class="hollow-out-text">镂空文字</div>
```
CSS：
```CSS
.hollow-out-text{
    text-align: center;
    font-size: 40px;
    /*设置背景透明*/
    -webkit-text-fill-color: transparent;
    /*设置镂空线条*/
    -webkit-text-stroke: 1px #cc00ff;
}
```
最终效果：

![镂空文字](6.png)
