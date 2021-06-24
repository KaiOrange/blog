---
title: for...of循环的使用
date: 2021-06-24 15:12:59
author: Orange
tags:
  - 基本语法
categories: JavaScript
---



> for...of语句在可迭代对象（包括 Array，Map，Set，String，TypedArray，arguments 对象等等）上创建一个迭代循环，调用自定义迭代钩子，并为每个不同属性的值执行语句。
> -- [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for...of)

----

## 基本使用 ##

for...of的基本使用比较简单：

```JavaScript
// 遍历数组
let array = ['a', 'b', 'c'];

for (let value of array) {
  console.log(value); // 分别打印 'a' 'b' 'c'
}

// 遍历字符串
let str = "abc";

for (let value of str) {
  console.log(value); // 分别打印 'a' 'b' 'c'
}

// 遍历Map
let map = new Map([["a", 1], ["b", 2], ["c", 3]]);

for (let value of map) {
  console.log(value); // 分别打印 ["a", 1] ["b", 2] ["c", 3]
}

// 遍历Set
let set = new Set(['a', 'a', 'b', 'c', 'b', 'c']);

for (let value of set) {
  console.log(value); // 分别打印 'a' 'b' 'c'
}

// 遍历arguments
(function() {
  for (let argument of arguments) {
    console.log(argument); // 分别打印 'a' 'b' 'c'
  }
})('a', 'b', 'c');
```

## 可迭代对象 ##

for...of的语法比较简单，上面我们遍历了这么多数据，现在我们使用for...of遍历一下对象：

```JavaScript
let object = {
  a: 1,
  b: 2,
  c: 3,
}
for (let value of object) {
  console.log(value); // 报错：Uncaught TypeError: object is not iterable
}
```

结果很不幸，使用for...of遍历对象报错了。为什么报错了，报错的错误提示写的很清楚，因为object对象不是可迭代的，也就是说它不是**可迭代对象**。

这里遇到一个新的名词，什么是**可迭代对象**呢？

要成为**可迭代对象**， 这个对象必须实现`@@iterator`方法，并且该方法返回一个符合`迭代器协议的对象`。

这里有2个问题，第一怎么去实现一个`@@iterator`方法？看到`@@xxx`这样的方法，想都不用想就是指`[Symbol.xxx]`方法，这里也就是一个方法的key是`[Symbol.iterator]`就可以了，比如：

```JavaScript
let object = {
  a: 1,
  b: 2,
  c: 3,
  [Symbol.iterator]: function() {}
}
```

第二个问题什么是符合`迭代器协议的对象`？首先`迭代器协议的对象`是一个对象，这个对象有一个`next`方法，这个`next`方法每次调用有会返回一个对象，这个返回的对象又有一个`done`属性和一个`value`属性。其中`done`属性表示是否完成，如果是`true`则表示完成，`false或者不写`则表示没有完成；value表示值，也就是for...of循环时每次使用的值，如果done为true时候则可以不写。举个**可迭代对象**的例子：

```JavaScript
let loop10 = {
  [Symbol.iterator]: function() {
    let i = 0

    return {
      next: function() {
        return {
          value: i++,
          done: i > 10
        }
      }
    }
  }
}

for (let value of loop10) {
  console.log(value); // 分别打印 0 1 2 3 4 5 6 7 8 9
}
```

`迭代器协议的对象`也可以自己调用着玩玩：

```JavaScript
let iterator = loop10[Symbol.iterator]();
iterator.next(); // 返回 {value: 0, done: false}
iterator.next(); // 返回 {value: 1, done: false}
iterator.next(); // 返回 {value: 2, done: false}
```

当然`迭代器协议的对象`不仅仅只能用在for-of循环中，也可以用在数组的解构上：

```JavaScript
let arr = [...loop10]; // arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

## 可迭代对象与generator函数 ##

当我们看到一个个可迭代对象的next方法，再看看一个个的`{value: 0, done: false}`这种符合`迭代器协议的对象`，这时不想跟generator没点关系都不行了，没错generator函数返回的正是可迭代对象。我们先使用常规方法实现一下对象的for...of遍历。

```JavaScript
let object = {
  a: 1,
  b: 2,
  c: 3,
  [Symbol.iterator]: function() {
    let keys = Object.keys(this);
    let i = 0

    return {
      next: function() {
        return {
          value: keys[i++],
          done: i > keys.length
        }
      }
    }
  }
}
for (let value of object) {
  console.log(value); // 分别打印 'a' 'b' 'c'
}
```

使用generator函数可以简化上述步骤：

```JavaScript
let object = {
  a: 1,
  b: 2,
  c: 3,
  [Symbol.iterator]: function *() {
    let keys = Object.keys(this)
    for (let i = 0; i < keys.length; i++) {
      yield keys[i]
    }
  }
}
for (let value of object) {
  console.log(value); // 分别打印 'a' 'b' 'c'
}
```

是不是很方便？这里偷偷告诉你一个小秘密：**generator函数调用后的对象也可以用在for...of上**。

```JavaScript
let loop10Gen = function *() {
  for (let i = 0; i < 10; i++) {
    yield i
  }
}

// 注意这里是loop10Gen() 而不是loop10Gen
for (const value of loop10Gen()) {
  console.log(value); // 分别打印 0 1 2 3 4 5 6 7 8 9
}
```

上面不是说了，可迭代对象要实现一个`@@iterator`方法，这里实现了吗？没错，这里还真实现了！你可以试试：

```JavaScript
let itarator = loop10Gen();
itarator[Symbol.iterator]() === itarator; // 返回true
```

于是我们就得到一个比较绕的真理：**generator调用后的对象，既是可迭代对象，也是符合`迭代器协议的对象`。**

## for...of与for...in的区别 ##

1. for...in遍历的是对象的可枚举属性，而for...of语句遍历的是可迭代对象所定义要迭代的数据。

  由于for...in遍历的是对象的可枚举属性，所以对于数组来说打印的是键，而不是值：

  ```JavaScript
  let array = ['a', 'b', 'c'];

  for (const value in array) {
    console.log(value); // 分别打印 '0' '1' '2'
  }

  for (const value of array) {
    console.log(value); // 分别打印 'a' 'b' 'c'
  }
  ```

2. for...in会遍历对象原型和原型链上的可枚举的属性。

  ```JavaScript
  let array = ['a', 'b', 'c'];

  Object.prototype.formObject = true;
  Array.prototype.formArray = true;
  array.hello = 'world'


  for (const value in array) {
    console.log(value); // 分别打印 0 1 2 hello formArray formObject
  }

  for (const value of array) {
    console.log(value); // 分别打印 'a' 'b' 'c'
  }
  ```

  通常为了避免for...in遍历原型和原型链上无关的可枚举属性，使用`Object.hasOwnProperty()`方法来判断：

  ```JavaScript
  let array = ['a', 'b', 'c'];

  Object.prototype.formObject = true;
  Array.prototype.formArray = true;
  array.hello = 'world'

  for (const value in array) {
    if (Object.hasOwnProperty.call(array, value)) {
      console.log(value); // 分别打印 0 1 2 hello
    }
  }

  for (const value of array) {
    console.log(value); // 分别打印 'a' 'b' 'c'
  }
  ```

## 可迭代对象的return方法 ##

可迭代对象除了next方法外还有return方法，主要用在循环中断的时候会调用，比如是用`break`关键字、或者抛出一个Error：

```JavaScript
let loop10 = {
  [Symbol.iterator]: function() {
    let i = 0

    return {
      next: function() {
        return {
          value: i++,
          done: i > 10
        }
      },
      return: function() {
        console.log('return调用了~~')
        return { done: true };
      }
    }
  }
}

for (let value of loop10) {
  console.log(value); // 分别打印 0 1 2 3
  if (value === 3) {
    break; // 打印 'return调用了~~'
  }
}
```
