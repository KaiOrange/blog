---
title: 《JavaScript ES6 函数式编程入门经典》读书笔记
date: 2020-10-18 22:00:00
author: Orange
tags:
  - JavaScript
  - 函数式编程
categories: 读书笔记
---

这本书和之前讲的[《JavaScript函数式编程指南》](https://www.kai666666.top/2019/03/10/%E3%80%8AJavaScript%E5%87%BD%E6%95%B0%E5%BC%8F%E7%BC%96%E7%A8%8B%E6%8C%87%E5%8D%97%E3%80%8B%E8%AF%BB%E4%B9%A6%E7%AC%94%E8%AE%B0/)内容上有很大的重叠部分，就算是函数式编程的一个回顾吧。本书将的很多概念性的东西写的非常透彻，有必要再记录一遍，书也很薄（只有172页，图片看着厚很可能是出版社为了诱导消费者买书😂），值得一读！为了讲清楚函数式编程，书中的例子都是采用最精简的代码，并没有考虑代码的效率，甚至与我们常用的API稍微有点区别。

![《JavaScript ES6 函数式编程入门经典》](1.jpg)

----

### 函数式编程简介 ###

**函数式编程**是一种范式，我们能够以此创建仅依赖输入就可以完成自身逻辑的函数。这保证了当函数多次调用时仍然返回相同的结果。函数不会改变任何外部环境的变量，这将产生可缓存，可测试的代码库。

**引用透明性**：函数对于相同的输入都将返回相同的值。

**纯函数**：相同的输入返回相同输出的函数，该函数不应依赖任何外部变量，也不应改变任何外部变量。

### 高阶函数 ###

高阶函数：接收函数作为参数或者返回函数作为输出的函数。

高阶函数举例（为了讲清楚内容，这里的函数都是低效的）：

1. every（数组通过计算，若所有元素是否为true，则为true）

    ```JavaScript
    const every = (arr,fn) => {
        let result = true;
        for(const value of arr)
        result = result && fn(value)
        return result
    }

    every([NaN, NaN, NaN], isNaN) // true 
    every([NaN, NaN, 1], isNaN) // false
    ```

2. some（数组通过计算，只要有一个为true，那么结果为true）

    ```JavaScript
    const some = (arr,fn) => {
        let result = false;
        for(const value of arr)
        result = result || fn(value)
        return result
    }

    some([NaN,NaN, 4], isNaN) // true 
    some([3,4, 4], isNaN) // false
    ```

3. unless（如果传入值是false时，则执行函数）

    ```JavaScript
    const unless = (predicate,fn) => {
        if(!predicate)
            fn()
    }
    ```

4. times（从0开始迭代多少次）

    ```JavaScript
    const times = (times, fn) => {
        for (var i = 0; i < times; i++) fn(i);
    }

    // 打印0~99之间（共100个）的偶数
    times(100, function(n) {
        unless(n % 2, function() {
            console.log(n, "is even");
        });
    });
    ```

### 闭包与高阶函数 ###

**闭包就是一个内部函数**。如下，其中函数inner被称为闭包函数。

```JavaScript
function outer() {
    function inner() {
    }
}
```

闭包可访问的作用域：

1. 自身函数内的作用域；
2. 全局作用域；
3. 闭包所在的外部函数的作用域。

如下：
```JavaScript
let a = "全局作用域";
function outer() {
    let b = "闭包所在的外部函数的作用域";
    function inner() {
        let c = "自身函数内的作用域";
        console.log(a, b, c);
    }
}
```

闭包可以记住上下文：

```JavaScript
var fn = (arg) => {
    let outer = "visible";
    let innerFn = () => {
        console.log(outer);
        console.log(arg);
    }
}

var closureFn = fn(5);
closureFn();// 打印 "visible" 和 5
```

上述代码需要注意closureFn函数已经在fn外部了，但是仍可以访问fn的变量outer，这个是闭包最重要的特征。

高阶函数举例（续）：

1. tap（接收一个value返回一个函数，当函数执行时第一个参数是value）
   
    ```JavaScript
    const tap = (value) =>
        (fn) => (
            typeof(fn) === 'function' && fn(value),
            console.log(value)
        )

    tap("fun")(value => console.log("value is " + value));// 打印 "value is fun"
    ```

2. unary （将多参函数转化为一个参数的函数）
   
    ```JavaScript
    const unary = (fn) =>
        fn.length === 1
            ? fn
            : (arg) => fn(arg) 

    ['1', '2', '3'].map(parseInt);// 经典面试题 因为parseInt接受的第二个参数表示多少进制 导致最后返回的是 [1, NaN, NaN,]
    ['1', '2', '3'].map(unary(parseInt));// 返回 [1, 2, 3]
    ```

3. once （函数只运行一次）
   
    ```JavaScript
    const once = (fn) => {
        let done = false;

        return function () {
            return done ? undefined : ((done = true), fn.apply(this, arguments))
        }
    }

    
    var doPayment = once(() => {
        console.log("Payment is done")
    })

    // 原函数执行，打印 "Payment is done"
    doPayment()

    // 原函数不执行
    doPayment()
    ```

4. memoized （函数记忆化）
   
    ```JavaScript
    const memoized = (fn) => {
        const lookupTable = {};
            
        return (arg) => lookupTable[arg] || (lookupTable[arg] = fn(arg));
    }

    // 计算阶乘
    var factorial = (n) => {
        if (n === 0) {
            return 1;
        }

        // This is it! Recursion!!
        return n * factorial(n - 1);
    }

    // 记忆化阶乘函数
    let fastFactorial = memoized(factorial);
    // 下面打印 "Fast Factorial of 3 is 6"
    console.log("Fast Factorial of 2 is", fastFactorial(3));
    // 下面打印 "Fast Factorial of 3 is 6" 第二次的时候记忆化后的参数不再重新计算 直接返回6
    console.log("Fast Factorial of 3 is", fastFactorial(3));
    ```

### 闭包与高阶函数 ###

1. map（将数组转化为一个新的数组）
   
    ```JavaScript
    const map = (array,fn) => {
        let results = []
        for(const value of array)
            results.push(fn(value))

        return results;  
    }

    let squaredArray = map([1,2,3], (x) => x * x);
    console.log(squaredArray); // [1, 4, 9]
    ```

2. filter（过滤函数）
   
    ```JavaScript
    const filter = (array,fn) => {
        let results = []
        for(const value of array)
            (fn(value)) ? results.push(value) : undefined

        return results;  
    }

    // 实例：返回数组中的基数
    filter([1, 2, 3, 4], (x)=>x % 2 === 1);// [1, 3]
    ```


3. concatAll（数组扁平化，实际上就是我们常用的flatten，作用是将多个数组，合并成一个数组）
   
    ```JavaScript
    const concatAll = (array) => {
        let results = []
        for(const value of array)
            results.push.apply(results, value);

        return results;  
    }

    concatAll([[1, 2, 3], [3, 4, 5]]); // 结果为 [1, 2, 3, 3, 4, 5]
    ```


4. reduce（累计计算）
   
    ```JavaScript
    const reduce = (array, fn, initialValue) => {
        let accumlator;

        if(initialValue != undefined)
            accumlator = initialValue;
        else
            accumlator = array[0];

        if(initialValue === undefined)
            for(let i=1;i<array.length;i++)
                accumlator = fn(accumlator,array[i])
        else
            for(const value of array)
                accumlator = fn(accumlator,value)

        return accumlator	
    }

    reduce([1,2,3,4,5],(acc,val) => acc + val,0); // 计算加法 返回 15
    reduce([1,2,3,4,5],(acc,val) => acc * val,1); // 计算乘法 返回 120
    ```


5. zip（合并两个指定的函数）
   
    ```JavaScript
    const zip = (leftArr,rightArr,fn) => {
        let index, results = [];

        for(index = 0;index < Math.min(leftArr.length, rightArr.length);index++)
            results.push(fn(leftArr[index],rightArr[index]));
        
        return results; 
    }

    zip([1, 2, 3],[4, 5, 6], (x, y) => x + y)); // 返回 [5, 7, 9]
    ```

### 柯里化与偏应用 ###

**一元函数**：只接受一个参数的函数。

**二元函数**：只接受两个参数的函数。

**变参函数**：接受可变数量参数的函数。

如下：

```JavaScript
const identify = (x) => x; // 一元函数
const add = (x, y) => x + y; // 二元函数

function variadic(a) { // 变参函数
    console.log(a);
    console.log(arguments);
}

variadic(1, 2, 3); // 打印1 [1, 2, 3] 需要注意的是arguments不是数组类型 是Arguments类的实例

function variadic2(a, ...variadic) { // 变参函数
    console.log(a);
    console.log(variadic);
}

variadic2(1, 2, 3); // 打印1 [2, 3]
```

**柯里化**：柯里化是把一个多参数函数转化为可嵌套的一元函数的过程。

一元柯里化：

```JavaScript
const curry = (binaryFn) => {
  return function (firstArg) {
    return function (secondArg) {
      return binaryFn(firstArg, secondArg);
    };
  };
};

const add = (x,y) => x + y;
let autoCurriedAdd = curry(add)
console.log("Curried summation", autoCurriedAdd(2)(2)); // 打印 "Curried summation 4"
```

多元柯里化：

```JavaScript
const curryN =(fn) => {
    if(typeof fn!=='function'){
        throw Error('No function provided');
    }

    return function curriedFn(...args){
      
      //make it bold
      if(args.length < fn.length){
        return function(){
          return curriedFn.apply(null, args.concat( [].slice.call(arguments) ));
        };
      }
      //make it bold

      return fn.apply(null, args);
    };
};

// 实战：使用柯里化实现一秒后延迟调用函数
const setTimeoutWrapper = (time,fn) => {
  setTimeout(fn,time);
}
// 使用柯里化
const delayTenMs = curryN(setTimeoutWrapper)(1000);
delayTenMs(() => console.log("Do X task")); // 一秒后打印 "Do X task"
delayTenMs(() => console.log("Do Y task")); // 一秒后打印 "Do Y task"
```

回顾上面柯里化的例子，由于柯里化的参数是从左往右的，所以我们不得不定义一个转化函数setTimeoutWrapper将函数转化为多个嵌套函数，也就是curryN调用完`curryN(setTimeoutWrapper)`再调用一下返回的函数，并传递参数`1000`。那么能否提供一个函数，使得函数某几个参数始终都是相同的呢，这里就用到了偏函数，如下：


```JavaScript
const partial = function (fn,...partialArgs){
    let args = partialArgs.slice(0);
    return function(...fullArguments) {
        let arg = 0;
        for (let i = 0; i < args.length && arg < fullArguments.length; i++) {
        if (args[i] === undefined) {
            args[i] = fullArguments[arg++];
            }
        }
        return fn.apply(this, args);
    };
};

// 使用偏函数 函数1秒后执行
// 本书中的例子使用undefined来表示后续需要传入的参数 
// 这里setTimeout第一个参数由调用时候决定 第二个参数固定永远是1000 表示1秒后调用
let delayTenMsPartial = partial(setTimeout, undefined, 1000); 
delayTenMsPartial(() => console.log("Do X. . .  task"))
delayTenMsPartial(() => console.log("Do Y . . . . task"))
```

### 管道与组合 ###

Unix中使用管道符号“|”来组合一些命令，使得前一个命令的输出是后一个命令的输入。如我们要统计某个文本文件中“World”出现的次数，可以使用下面的命令。

```shell
cat test.txt | grep "World" | wc
```

**函数的组合**：将一个函数的输出当成另一个函数的输入，最终把两者合并成一个函数。

```JavaScript
var compose = (a, b) => (c) => a(b(c))

let number = compose(Math.round,parseFloat); // 将一个函数转化为浮点型数字后并四舍五入
console.log("Number is ",number("3.56")); // 打印 "Number is  4"
```

组合多个函数：

```JavaScript
const composeN = (...fns) =>
  (value) =>
    reduce(fns.reverse(),(acc, fn) => fn(acc), value);

// 应用：判断一句话有奇数个单词还是偶数个
let splitIntoSpaces = (str) => str.split(" ");
let count = (array) => array.length;
let oddOrEven = (ip) => ip % 2 == 0 ? "even" : "odd";

// 使用组合函数 先拆分字符串 然后计算个数 随后看个数是奇数个还是偶数个
let oddOrEvenWords = composeN(oddOrEven,count,splitIntoSpaces);
// 打印 "Even or odd via compose ? odd"
console.log("Even or odd via compose ?",oddOrEvenWords("hello your reading about composition"));
```

上述组合函数参数是从右往左依次调用的，如果是从左往右那么就叫做**管道**了，也有成为序列。管道是组合的复制品，唯一修改的地方就是数据流的方向。

```JavaScript
const pipe = (...fns) =>
  (value) =>
    reduce(fns,(acc, fn) => fn(acc), value);

// 在上例中使用管道
let oddOrEvenWords = pipe(splitIntoSpaces,count,oddOrEven);
```

**组合满足结合律**：`compose(f, compose(g, h)) === compose(compose(f, g), h)`

### 函子 ###

**函子**：函子是一个普通对象（在其他语言中可能是一个类），它实现了map函数，在遍历每个对象值的时候生成一个新的对象。

实际上数组就是函子！下面一步一步实现一个普通的函子：

```JavaScript
// 首先定义一个容器 由于需要new一个对象 所以这里没使用箭头函数
// 函子只跟提供map函数有关 跟类名是无关的 这里的Container也可以换成其他名称
const Container = function(val) {
  this.value = val;
}

// 这里为了方便创建对象 添加了一个of方法
Container.of = function(value) {
  return new Container(value);
} 

// 只要提供了map方法 使用Container创建的对象就是函子
// map方法实现需要根据实际情况来确定 这里提供了一种实现
Container.prototype.map = function(fn){ 
  return Container.of(fn(this.value));
}

// 使用of方法来创建函子
let testValue = Container.of(3);// 函子的值是一个数字
let testObj = Container.of({a:1});// 函子的值是一个对象
let testArray = Container.of([1,2]);// 函子的值是一个数组
let testContainer = Container.of(Container.of(3));// 函子的值也可以是一个函子

// 实例：将3加倍2次
let double = (x) => x + x;
console.log(Container.of(3).map(double).map(double).value); // 打印12
```

现在简绍一种新的函子，叫MayBe。**MayBe函子是用来处理函数式编程空值问题的**，实现如下：

```JavaScript
// 定义一个容器 跟上面一样的 就是改了一个名字
const MayBe = function(val) {
  this.value = val;
}

// of方法用来方便创建对象的 没必要每次new来new去
MayBe.of = function(val) {
  return new MayBe(val);
}

// 这里为了方便添加了一个辅助方法 用来判空的
MayBe.prototype.isNothing = function() {
  return (this.value === null || this.value === undefined);
};

// 最重要的方法map 如果是空的那么返回一个空的函子 否则返回函数执行结果的函子
MayBe.prototype.map = function(fn) {
  return this.isNothing() ? MayBe.of(null) : MayBe.of(fn(this.value));
};


// MayBe函子的使用
MayBe.of("string").map((x) => x.toUpperCase()).value // 返回 "STRING"
MayBe.of(null).map((x) => x.toUpperCase()).value // 返回 null 注意这里索然返回了null 但是程序还可以运行
// map 可以连用
MayBe.of("George").map((x) => x.toUpperCase()).map((x) => "Mr. " + x).value //返回 "Mr. GEORGE"
MayBe.of("George").map(() => undefined).map((x) => "Mr. " + x).value // 返回 null 运行过程中某一步返回空也不会导致程序奔溃
```

MayBe函子中每一个map函数都会执行，但是如果某一个map返回的是空，那么它后面的map函数的参数函数就都不会执行了，单map函数仍然会执行。

MayBe函子解决了空值的问题，**Either函子**解决或运算，Either函子实现如下：

```JavaScript
const Nothing = function(val) {
  this.value = val;
};

Nothing.of = function(val) {
  return new Nothing(val);
};

Nothing.prototype.map = function(f) {
  return this;
};

const Some = function(val) {
  this.value = val;
};

Some.of = function(val) {
  return new Some(val);
};

Some.prototype.map = function(fn) {
  return Some.of(fn(this.value));
}

// Either.Some 与 Either.Nothing 这两个函子统称为Either函子
const Either = {
  Some : Some,
  Nothing: Nothing
}

// 到这里 我想你应该还是一头雾水 这个有什么用处呢？
// 由上 实际上Either.Nothing无论调用多少个map始终返回的是自己

// 应用：如果一个数是基数那么乘以5然后加100 如果这个数是偶数则返回自己
let oddOrEven = (num) => num % 2 === 1 ? Either.Some.of(num) : Either.Nothing.of(num);
let mul5 = num => num * 5;
let add100 = num => num + 100;
oddOrEven(5).map(mul5).map(add100).value // 返回 125
oddOrEven(6).map(mul5).map(add100).value // 返回 6
```

Either函子在实际应用时，如果值在计算中不再参与计算的时候就使用`Either.Nothing`否则使用`Either.Some`。

**Point函子**：Point函子是函子的子集，它具有of方法。

我们写的MayBe函子和Either都实现了of方法，所以这两个都是Point函子。另外我们常用的数组，ES6也新增了of方法，所以它也是Point函子。

### 深入理解Monad ###

Monad也是一种函子，估计你看到Monad这个词你就头大了。此时你的内心：“卧槽！又要学习一个新的函子，真心学不动了，求别更新了！！！”

其实，函子这块就是纸老虎，各种名字天花乱坠，实际上都是很简单的，Monad也不例外，先看看Monad的定义。

**Monad就是一个含有chain方法的函子。**

是不是纸老虎，在说chain方法之前我们先简单的说一下另一个方法join，上面我们创建`MayBe`函子以后最后都要调用`.value`来返回真正的值，这里添加一个join方法，如果不为空的时候就返回函子的`value`否则返回`MayBe.of(null)`，如下：

```JavaScript
MayBe.prototype.join = function() {
  return this.isNothing() ? MayBe.of(null) : this.value;
}

// 使用
MayBe.of(5).join() // 返回5
MayBe.of(MayBe.of(3)).join().join() // 返回3 有多少个of最后就得调用多少个join()
MayBe.of(MayBe.of(3).join()).join() // 返回3 这样也是可以的
```

我们一般使用`MayBe`的时候都会调用map函数的，大多数情况最后一个map调用完我们还会调用上面的join方法来获取value。为了简化最后这两步我们引入了chain方法：

```JavaScript
MayBe.prototype.chain = function(f){
  return this.map(f).join()
}

// 有了chain方法 就可以简化一下之前的代码
MayBe.of("string").chain((x) => x.toUpperCase()) // 返回 "STRING"
MayBe.of(null).chain((x) => x.toUpperCase()) // 返回 MayBe {value: null}
MayBe.of("George").map((x) => x.toUpperCase()).chain((x) => "Mr. " + x) //返回 "Mr. GEORGE"
```

这就是Monad的全部内容，没错就这！相信你已经理解的很深入了！

我们回顾一下这两节的内容：**有map方法的对象就是函子，有of方法的函子就是Point函子，有chain方法的函子就是Monad函子**。

### Generator ###

本书最后一章介绍了ES6的Generator的使用，这里就简述一下：

```JavaScript
// 创建Generator（就是函数名和function之间加一个*）
function* gen() {
    return 'first generator';
}

// 调用Generator 此时只返回一个Generator对象 函数并不会立即执行
let generatorResult = gen();

// 执行函数
generatorResult.next(); // 返回 {value: "first generator", done: true}

// 如果要获取Generator的值则需要使用 generatorResult.next().value

// 执行完可以继续调用
generatorResult.next(); // 返回 {value: undefined, done: true}

// 调用Generator可以使用yield关键字
function* generatorSequence() {
    yield 'first';
    yield 'second';
    yield 'third';
}

let generatorSequenceResult = generatorSequence();

generatorSequenceResult.next(); // 返回 {value: "first", done: false}
generatorSequenceResult.next(); // 返回 {value: "second", done: false}
generatorSequenceResult.next(); // 返回 {value: "third", done: false}
generatorSequenceResult.next(); // 返回 {value: undefined, done: true}

// 需要注意的是generatorSequence有三个yield，虽然第三个yield是最后一行代码
// 但是当他执行完后下一次还会执行一下return的代码 默认相当于return undefined

// 向Genetator传参
function* sayFullName() {
    var firstName = yield 123;
    var secondName = yield 456;
    console.log(firstName + secondName);
}

let fullName = sayFullName();
fullName.next(); // 返回 {value: 123, done: false}
// 注意第一个nuxt调用的时候会执行代码到第一个yield处
// 当第二次执行next的时候才会给第一个yield传参
fullName.next('anto'); // 返回 {value: 456, done: false}
fullName.next('aravinth'); // 打印 "antoaravinth" 返回 {value: undefined, done: true} 

```