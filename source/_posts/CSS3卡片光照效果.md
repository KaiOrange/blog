---
title: CSS3卡片光照效果
date: 2019-03-25 20:19:11
author: Orange
tag:
	- CSS效果
categories: CSS
---

我们今天要使用CSS3实现下面这样的卡片光照效果：

![卡片光照](1.gif)

----

## 实现 ##

首先给出HTML结构：
```HTML
<div class="hover-light">卡片光照效果</div>
```
然后给出初始的CSS结构:

```CSS
.hover-light{
    width: 250px;
    height: 180px;
    margin: 0 auto;
    background: #70c3ff;
    color:white;
    font-size: 2rem;
    text-align: center;
    border-radius: 8px;
}
```

此时效果大概是这个样子:
![初始样式](2.png)

要实现卡片光照的效果，我们需要添加子元素，此时使用伪元素`::after`是最好的选择。我们需要给`::after`添加一个斜着的渐变来模拟光照效果，这里我们使用从左到右的渐变，然后再给一个倾斜的形变就可以模拟了。最好再给一个简单的悬浮动画就完事了。下面直接给出CSS的其他代码：

```CSS
.hover-light{
    width: 250px;
    height: 180px;
    margin: 0 auto;
    background: #70c3ff;
    color:white;
    font-size: 2rem;
    text-align: center;
    border-radius: 8px;

    /*子绝父相对*/
    position: relative;
    /*子溢出父元素隐藏 这样hover子元素的时候 不算hover父元素*/
    overflow: hidden;
}
.hover-light::after{
    content: "";
    position: absolute;
    /*首先隐藏子元素*/
    left: -100%;
    top: 0;
    /*设置和父元素一样大*/
    width: 100%;
    height: 100%;
    /*添加从左往右的渐变 即模仿光照效果*/
    background-image: -webkit-linear-gradient(0deg,hsla(0,0%,100%,0),hsla(0,0%,100%,.5),hsla(0,0%,100%,0));
    background-image: linear-gradient(to right,hsla(0,0%,100%,0),hsla(0,0%,100%,.5),hsla(0,0%,100%,0));
    /*光照是斜着的更好看*/
    -o-transform: skewx(-25deg);
    -moz-transform: skewx(-25deg);
    -webkit-transform: skewx(-25deg);
    transform: skewx(-25deg);
    /*添加动画效果*/
    transition: all .3s ease;
}

.hover-light:hover::after {
    /*鼠标放在父元素上 移动子元素*/
    left: 100%;
}
```

通过这样就实现了上面的卡片光照效果!

## 进阶 ##
上面光照效果已经完成，其实CSS3的形变投影等功能组合起来可以实现更好的效果，我们现在添加样式，给父元素也添加一个动画的效果：

```CSS
.hover-light{
    /*... 其他代码相上*/

    transition: all .3s ease;
}
.hover-light::after{
    /*... 其他代码相上*/

    /*添加动画效果 直接继承父类的效果*/
    transition: inherit;
}

.hover-light:hover {
    /*向上移动6个像素*/
    -moz-transform: translateY(-6px);
    -webkit-transform: translateY(-6px);
    transform: translateY(-6px);
    /*添加一个淡一点的阴影*/
    -moz-box-shadow: 0 26px 40px -24px rgba(0,36,100,.5);
    -webkit-box-shadow: 0 26px 40px -24px rgba(0,36,100,.5);
    box-shadow: 0 26px 40px -24px rgba(0,36,100,.5);
}
```

此时的效果：

![添加阴影动画](3.gif)

完整HTML代码：

```HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>CSSS3卡片光照效果</title>
    <style>
        body{
            padding: 20px;
        }

        .hover-light{
            width: 250px;
            height: 180px;
            margin: 0 auto;
            background: #70c3ff;
            color:white;
            font-size: 2rem;
            text-align: center;
            border-radius: 8px;
            /*子绝父相对*/
            position: relative;
            /*子溢出父元素隐藏 这样hover子元素的时候 不算hover父元素*/
            overflow: hidden;
            transition: all .3s ease;
        }
        .hover-light::after{
            content: "";
            position: absolute;
            /*首先隐藏子元素*/
            left: -100%;
            top: 0;
            /*设置和父元素一样大*/
            width: 100%;
            height: 100%;
            /*添加从左往右的渐变 即模仿光照效果*/
            background-image: -webkit-linear-gradient(0deg,hsla(0,0%,100%,0),hsla(0,0%,100%,.5),hsla(0,0%,100%,0));
            background-image: linear-gradient(to right,hsla(0,0%,100%,0),hsla(0,0%,100%,.5),hsla(0,0%,100%,0));
            /*光照是斜着的更好看*/
            -o-transform: skewx(-25deg);
            -moz-transform: skewx(-25deg);
            -webkit-transform: skewx(-25deg);
            transform: skewx(-25deg);
            /*添加动画效果 直接继承父类的效果*/
            transition: inherit;
        }

        .hover-light:hover::after {
            /*鼠标放在父元素上 移动子元素*/
            left: 100%;
        }
        .hover-light:hover {
            /*向上移动6个像素*/
            -moz-transform: translateY(-6px);
            -webkit-transform: translateY(-6px);
            transform: translateY(-6px);
            /*添加一个淡一点的阴影*/
            -moz-box-shadow: 0 26px 40px -24px rgba(0,36,100,.5);
            -webkit-box-shadow: 0 26px 40px -24px rgba(0,36,100,.5);
            box-shadow: 0 26px 40px -24px rgba(0,36,100,.5);
        }
    </style>
</head>
<body>
    <div class="hover-light">卡片光照效果</div>
</body>
</html>
```
