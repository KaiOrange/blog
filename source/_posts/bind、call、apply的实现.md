---
title: bind、call、apply的实现
date: 2019-04-18 11:17:28
author: Orange
tag:
	- bind
	- call
	- apply
categories: JavaScript
---

`bind`、`call`、`apply`是JavaScript中`Function.prototype`非常重要的三个方法，他们的作用是改变`this`的指向。三者的区别是：

> `bind`返回一个函数，该函数改变了`this`的指向。
> `call`直接调用函数，也可以传递参数用逗号隔开。
> `apply`直接调用函数，也可以传递参数使用数组传递给第二个参数。

我们现在详细解读一下各个函数的实现方式。

### bind的实现 ###

`bind`的基本用法：
1. 函数调用`bind`，返回一个新的函数。
2. `bind`方法的第一个参数是宿主对象，也就是执行的`this`。
3. `bind`返回函数执行时候的参数是`bind`方法第二个至多个参数与调用时参数的合集。

bind简单实现：
```JavaScript
Function.prototype.bind = function (context) {
    var self = this;// 这个this其实是真正的函数
    // 获取第二至多个参数
    var args = Array.prototype.slice.call(arguments, 1);
    // 返回一个函数 该函数是真正执行时的函数
    return function () {
        // 获取真正执行时传进来的函数
        var bindArgs = Array.prototype.slice.call(arguments);
        // 合并参数 并且调用函数
        return self.apply(context, args.concat(bindArgs));
    }
}
```

这个简单的`bind`已经解决了上面的三个基本用法了，其实`bind`还有2个附加的特性：
4. 如果上面self不是函数（防止非函数的原型指向`Function.prototype`），那么会报错。
5. 从改变`this`的指向来看，`new`的优先级大于`bind`。

功能更强大的`bind`实现：
```JavaScript
Function.prototype.bind = function (context) {

    var self = this;
    if (typeof self !== "function") {// 如果self不是函数则报错
      throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var args = Array.prototype.slice.call(arguments, 1);

    // 定义一个中间函数 让返回的函数继承它
    var FN = function () {};

    var returnFn = function () {
        var bindArgs = Array.prototype.slice.call(arguments);
        // 重点 如果返回函数的this是FN 说明是new出来的 this就是new的对象 否则是context
        return self.apply(this instanceof FN ? this : context, args.concat(bindArgs));
    }

    // FN的原型指向函数的原型
    FN.prototype = self.prototype;
    // 返回的函数继承FN
    returnFn.prototype = new FN();
    return returnFn;
}
```

### call的实现 ###

`call`的基本用法：
1. 函数调用`call`，函数会执行，并且`this`指向了第一个函数。
2. `call`方法的第一个参数是`null`或者`undefined`的时候`this`会绑定在全局对象上。
3. `call`方法第二个至多个参数会传给执行的方法。

`call`方法简单实现：
```JavaScript
Function.prototype.call = function (context) {
    // 如果为空 则绑定在全局函数
    var context = context || window;
    // 使用context.fn() 来调用函数 来模拟fn绑定在context上
    context.fn = this;

    var args = [];
    for(var i = 1, len = arguments.length; i < len; i++) {
        args.push('arguments[' + i + ']');
    }

    // 这里比较尴尬 因为context.fn调用的时候 无法把不定长的arguments 一个一个地传进去
    // 所以就使用eval方法了 当然可以用apply但是稍后我们也要实现它 所以就不能用了
    var result = eval('context.fn(' + args +')');

    // 删除添加的方法（毁尸灭迹）
    delete context.fn;
    return result;
}
```

### apply的实现 ###

`apply`的基本用法：
1. 函数调用`apply`，函数会执行，并且`this`指向了第一个函数。
2. `apply`方法的第一个参数是`null`或者`undefined`的时候`this`会绑定在全局对象上。
3. `apply`方法第二个参数是一个数组，相当于函数执行时的参数。

`apply`方法简单实现：
```JavaScript
Function.prototype.apply = function (context, arr) {
    var context = context || window;
    context.fn = this;

    var result;
    if (!arr) {
        result = context.fn();
    }
    else {
        var args = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            args.push('arr[' + i + ']');
        }
        result = eval('context.fn(' + args + ')')
    }

    delete context.fn;
    return result;
}
```
