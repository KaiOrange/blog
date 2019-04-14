---
title: generator处理异步操作
date: 2019-04-14 12:00:00
author: Orange
tags:
  - generator
  - 异步
categories: JavaScript
---

`generator`是ES6新的语法，我们先简单的回顾一下他的使用：

### generator基本用法 ###

```JavaScript
function * genFn() {
  yield 'aaa';
  yield 'bbb';
  return 'ccc';
}

var gen = genFn();
gen.next();// {value: "aaa", done: false}
gen.next();// {value: "bbb", done: false}
gen.next();// {value: "ccc", done: true}
gen.next();// {value: undefined, done: true}
gen.next();// {value: undefined, done: true}
```

`generator`函数是在`function`和函数名之间添加`*`来定义的。`generator`函数调用后并没有真正的执行，当调用返回对象的`next`方法会执行并返回`generator`函数定义处的`yield`（或`return`）前面的值，从而使得执行与定义分离。

`generator`对象的`next`方法也可以传参：

```JavaScript
function * genFn(arg) {
    console.log("arg=" + arg)
    var a = yield 'aaa';
    console.log("a=" + a);
    var b = yield 'bbb';
    console.log("b=" + b);
    return 'ccc';
}

var gen = genFn("123");// 将arg的值赋值为“123” 但是并没有执行
var ga = gen.next("a");// 执行 打印"arg=123" 因为并没有yield所以相当于“a”的值没有赋值给任何变量
console.log(ga);// {value: "aaa", done: false}
var gb = gen.next("b");// 执行 并把"b" 传给变量a 打印"a=b" 
console.log(gb);// {value: "bbb", done: false}
var gc = gen.next("c");// 执行 把"c"的值赋值给b 打印"b=c"
console.log(gc);// {value: "ccc", done: true}
gen.next();// {value: undefined, done: true}
gen.next();// {value: undefined, done: true}
```

### generator简单异步处理 ###

现在使用有一个异步的`fetch`请求，打印出它返回的结果，我们可以这么写`generator`：
```JavaScript
function* asyncGenFn() {
  var result = yield fetch("https://api.github.com/emojis");
  console.log(result);
}

var gen = asyncGenFn();// 一定要注意这里没有执行
var result = gen.next();// {value: Promise, done: false}
// 此时的result.value就是asyncGenFn中的fetch返回的Promise 那么此时就可以这么处理了
result.value.then(data=>data.json())// 将数据转化为JSON格式
    .then((data)=>{
        gen.next(data);// 把data再传回asyncGenFn让他自己打印
    });
```

上面我们已经把一个异步操作用generator处理了，我们现在处理2个异步操作，再加一个fetch请求发送后的1秒后打印字符串的一个异步操作。
```JavaScript
var promise = new Promise(function(resolve, reject) {
    setTimeout(function (){
        resolve("Hello World");// 1秒后打印Hello World
    },1000);
});

function* asyncGenFn() {
    var result1 = yield fetch("https://api.github.com/emojis");
    console.log(result1);

    var result2 = yield promise;
    console.log("异步数据是：" + result2);
}

var gen = asyncGenFn();// 一定要注意这里没有执行
var result1 = gen.next();// {value: Promise, done: false
// 此时的result.value就是asyncGenFn中的fetch返回的Promise 那么此时就可以这么处理了
result1.value.then(data=>data.json())// 将数据转化为JSON格式
    .then((data)=>{
        var result2 = gen.next(data);// 把data再传回asyncGenFn让他自己打印
        // 调用这里的前半部分和之前的是一样的 现在开始处理第二个yield
        // 此时的resulet2的值是 {value: Promise, done: false}
        // 其中result2.value就是asyncGenFn中的promise 那么此时你可以
        result2.value.then((val)=>{// 这个val就是"Hello World"
            gen.next(val);// 把"Hello World"传回打印 "异步数据是：Hello World"
        });
    });
```

通过2次的异步请求我们貌似发现了点处理规律，上面对`generator`的处理基本上都是大同小异，唯一一点区别就是`result1.value.then`调用的时候先转换了一下数据。其实转换数据这一个步骤也是一个`Promise`那我们就可以把他当做异步来处理咯，也就是可以放在`asyncGenFn`函数内部来处理，请看这里：
```JavaScript
function* asyncGenFn() {
    var result1 = yield fetch("https://api.github.com/emojis");
	result1 = yield result1.json();// 异步就yield一下
	console.log(result1);

    var result2 = yield promise;//promise还是上面的promise
    console.log("异步数据是：" + result2);
}

var gen = asyncGenFn();// 一定要注意这里没有执行
gen.next().value.then((data)=>{// fetch
    gen.next(data).value.then((val)=>{// 转换为json
        gen.next(val).value.then((val)=>{// 异步promise
            gen.next(val); 
        });
    });
});

```

这下有没有豁然开朗，异步操作的执行其实是一个套路，就是递归调用`gen.next().value.then()`就可以了。由上可知，**异步的`generator`执行时如果遇到`yield`那么就去调用`gen.next().value.then()`去处理该`Promise`**，后面这个处理的过程是很机械地，我们是否可以把处理`Promise`这个过程封装一下，然后将注意力完全放在`generator`上呢，假如我们把这个封装好的东西叫他执行器，那样我们就彻底不需要关注执行器怎么实现了，只需要关注`generator`然后用执行器去执行它。此时你貌似懂了点什么，但是你还会问如果不是`Promise`的异步操作呢？我们先不考虑这种情况，这里假设你很聪明，传的所有的异步操作都是`Promise`。某大神说：“**过早的优化是万恶之源。**”。
现在我们就简单的实现一下这个执行器吧：

```JavaScript
function actuator(gen){// 接收一个 generator 函数
    var g = gen();// 并没有执行

    function next(data){
        var result = g.next(data);// 调用next方法
        if (result.done) return result.value;// 如果结束则返回值
        result.value.then(function(data){// 上面的套路
            next(data);// 递归调用
        });
    }

    next();
}

actuator(asyncGenFn); // 用执行器去执行 结果一下
```

### generator异步处理绕不开的一个库**co** ###

我们用了很少的几行代码写了一个执行器，其实这上面的`actuator`函数是对大神`TJ Holowaychuk`所写的**co**库的拙劣模仿，现在我们可以直接引用`co`库来实现我们的异步操作：
```JavaScript
var co = require('co');

co(asyncGenFn); // 就这么简单
```

处理`generator`的异步就这么简单，直接用`co`库包一层就会执行。之前我们还留了一个问题，如果`yield`后面的不是`Promise`那该怎么办？其实也好办，只要把它转换为`Promise`就可以了，`co`也是这么做的。另外我们这里假设都是直接成功的，失败的情况下并没有考虑，`co`已经把失败的情况也处理了。那它在我们的`actuator`函数的基础上做了那些操作呢？请看[co源码](https://github.com/tj/co/blob/master/index.js)，github仓库在[这里](https://github.com/tj/co)。

### async函数处理异步 ###

async函数处理异步也很简单，如上面的例子我们可以这么写：
```JavaScript
async function asyncFn() {// 使用async关键字的函数
    var result1 = await fetch("https://api.github.com/emojis");
	result1 = await result1.json();// 异步就await一下 await关键字只能用于async函数
	console.log(result1);

    var result2 = await promise;//promise还是上面的promise
    console.log("异步数据是：" + result2);
}

asyncFn();// 执行async函数
```

不知道你有没有发现`async`函数和`generator`函数处理异步的代码很相似，无非就是把`*`换成`async`并且挪了一个位置（不挪位置编译器还以为`async`是你的函数名呢），然后把里面的`yeild`换成了`await`。其实`async`函就是`generator`和`co`的语法糖：
```JavaScript
async function fn(args) {
    // ,,, 里面可能用到了await
}

// 就相当于

function fn(args) {
    return co(function* () {
        // ... 里面用到了yeild
    });
}

// 所以异步函数fn的执行fn()相当于用执行器co来执行generator
```
