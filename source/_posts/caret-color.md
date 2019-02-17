---
title: CSS改变input光标颜色
author: Orange
tag: 
  - CSS语法
categories: CSS
---
我们可能会有改变input光标颜色的需求，谷歌浏览器的默认光标颜色是黑色的，我们可以看到GitHub上的光标却是白色，那么这个用CSS怎么改变呢?
![默认的黑色光标](1.gif)
![GitHub白色的光标](2.gif)

--------------------------
这种效果有两种实现方式：
#### 1.使用color来实现
光标的颜色是继承自当前输入框字体的颜色，所以用`color`属性即可改变：
```CSS
input{
	color:red;
}
```
![使用color属性修改](3.gif)
#### 2.使用caret-color来实现
上一种方式已经修改了光标的颜色但是字体的颜色也改变了，如果只想改变光标的颜色而不改变字体的颜色那就使用`caret-color`属性:
```CSS
input{
	caret-color:red;
}
```
![使用caret-color属性修改](4.gif)