---
title: JavaScript易错点（长期更新）
date: 2019-04-08 14:11:11
author: Orange
tag:
	- 易错点
	- 面试题
categories: JavaScript
---

1. 下面输出的是什么

  ```JavaScript
  function F (){};
  F.prototype = null;
  var o1 = new F();
  console.log(F.prototype);
  console.log(o1.__proto__);

  var o2 = Object.create(null);
  console.log(o2.__proto__);
  ```

  答案：
  > null
  > object
  > undefined

  点评:
  **`new`的时候，如果构造函数的原型是是object类型那么浏览器会添加`o1.__proto__ = F.prototype`否则会添加`o1.__proto__ = Object.prototype`**

2. 下面输出的是什么

  ```JavaScript
  (function (){
    let a = this ? class b{} :class c{};
    console.log(typeof a,typeof b, typeof c);
  })();
  ```
  答案：
  > function undefined undefined

  点评:
  **class和function处于等式右边的时候不会向外暴露类名和函数名**

3.  下面输出的是什么

  ```JavaScript
  var arr1 = "john".split('');

  var arr2 = arr1.reverse();

  var arr3 = "jones".split('');

  arr2.push(arr3);

  console.log("array 1: length=" + arr1.length + " last=" + arr1.slice(-1));
  console.log("array 2: length=" + arr2.length + " last=" + arr2.slice(-1));
  ```
  答案：
  > array 1: length=5 last=j,o,n,e,s
  > array 2: length=5 last=j,o,n,e,s

  点评:
  **reverse会改变原数组，所以arr1和arr2其实是一个数组**

4.  下面输出的是什么

  ```JavaScript
  var a = {}, b = {key:'b'},c = {key:'c'};

  a[b] = 123;

  a[c] = 456;
  console.log(a[b]);
  ```

  答案：
  > 456

  点评:
  **`[]`访问属性的时候对于对象会调用`toString`方法，b和c的`toString`的结果都是`[object Object]`**


