---
title: 构造方法或new返回该对象
date: 2019-07-18 14:32:47
author: Orange
tags:
  - 小技巧
categories: JavaScript
---

一个小技巧，调用构造方法或都new返回该对象：

```JavaScript
function Person(){
  // ...

  // 不是new的时候this指向的是调用者 默认是window
  if (!(this instanceof Person)) {
    return new Person();
  }
}

Person.prototype.sayHello = function (){
  console.log("Hello World!");
}

var lufei = Person();
lufei.sayHello();
var nami = new Person();
nami.sayHello();
```
