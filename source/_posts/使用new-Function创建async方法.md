---
title: 使用new Function创建async方法
date: 2020-09-30 14:32:36
author: Orange
tags:
  - JavaScript
categories: JavaScript
---

## new Function创建方法 ##

正常的方法，如下：

```JavaScript
function add(a,b) {
  return a + b;
}

// 或者

var add = function (a, b) {
  return a + b;
}

```

使用`new Function`创建函数如下：

```JavaScript
// 创建函数
var add = new Function('a', 'b', "return a + b;");

// 使用
var result = add(1, 2); // result值为3
```

**new Function最后一个参数是函数体，前面的参数是变量名称，全部都是字符串的形式。**也就是：

```JavaScript
var function_name = new Function(arg1, arg2, ..., argN, function_body);
```

## new Function创建async方法 ##

```JavaScript
// 获取async函数的构造器
var AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
// 通过上面的构造器创建async方法
const fetchPage = new AsyncFunction("url", "return await fetch(url);");

// 使用
fetchPage("/").then(response => { ... }); // 请求具体的网络
```
