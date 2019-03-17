---
title: 《JavaScript函数式编程指南》读书笔记
date: 2019-03-10 16:04:32
author: Orange
tags:
  - JavaScript
  - 函数式编程
categories: 读书笔记
---

老规矩，这篇文章记录书中的重点部分，外加自己的见解，不会对全书进行复述，但记录的绝对是最重要的部分，想要了解跟多内容请看原版图书。

![《JavaScript函数式编程指南》](1.jpg)

----

函数式编程的目标：使用函数来抽象作用在数据之上的控制流与操作，从而在系统中消除副作用并减少对状态的改变。

纯函数所具有的性质：
>仅取决于提供的输入，而不依赖于任何在函数求值期间或调用间隔时可能变化的隐藏状态和外部状态。
>不会造成或超出其作用域的变化。如修改全局变量对象或引用传递的参数。

引用透明：如果一个函数对于相同的输入始终产生相同的结果，那么说它是引用透明的。

函数式编程是指为创建不可变的程序，通过消除外部可见的副作用，来对纯函数的声明式的求值过程。

高阶函数：某些函数可以接收其它的函数作为参数，或者返回一个函数，这样的函数称为高阶函数。

map函数的简单实现：
```JavaScript
function map(arr, fn) {
    const len = arr.length,
            result = new Array(len);
    for (let idx = 0; idx < len; ++idx) {
        result[idx] = fn(arr[idx], idx, arr);
    }
    return result;
}
```

reduce函数的简单实现：
```JavaScript
function reduce(arr, fn,accumulator) {
    let idx = -1,
        len = arr.length;
    if (!accumulator && len > 0) {
        accumulator = arr[++idx];
    }
    while (++idx < len) {
        accumulator = fn(accumulator,arr[idx], idx, arr);
    }
    return accumulator;
}
```

filter函数的简单实现：
```JavaScript
function filter(arr, predicate) {
    let idx = -1,
        len = arr.length,
        result = [];
    while (++idx < len) {
        let value = arr[idx];
        if (predicate(value, idx, this)) {
            result.push(value);
        }
    }
    return result;
}
```

lodash对象已经定义了好了很多函数，在本章中_代表lodash对象。使用lodash的reduce对数组求和：
```JavaScript
_([0,1,3,4,5]).reduce(_.add);  //-> 13
```

实战：格式化名字
```JavaScript
var names = ['alonzo church', 'Haskell curry', 'stephen_kleene',
             'John Von Neumann', 'stephen_kleene'];

const isValid = val => !_.isUndefined(val) && !_.isNull(val);

_.chain(names)
    .filter(isValid)
    .map(s => s.replace(/_/, ' '))
    .uniq()
    .map(_.startCase)
    .sort()
    .value(); 
//-> ['Alonzo Church', 'Haskell Curry', 'Jon Von Neumann', 'Stephen Kleene']
```

`_.chain`可以添加一个输入对象（或数组）的状态，从而能将这些输入转换为所需输出的操作链接在一起。
`_.chain`的另一个好处是可以惰性计算，在调用`value()`前并不会真正的执行任何操作。
它返回的是一个lodash包装对象，而不是原生的对象。

像写SQL一样编程
假如有SQL语句：
```SQL
SELECT p.firstname FROM Person p
WHERE p.birthYear > 1903 and p.country IS NOT 'US'
ORDER BY p.firstname
```

使用`_.mixin`可以给lodash对象添加新的函数（这里其实相当于起别名），如：
```JavaScript
_.mixin({'select':   _.map,
         'from':     _.chain,
         'where':    _.filter,
         'sortBy':   _.sortByOrder});
```

那么查询语句就可以修改为：
```JavaScript
_.from(persons)
   .where(p => p.birthYear > 1903 && p.address.country !== 'US')
   .sortBy(['firstname'])
   .select(p => p.firstname)
   .value();
```

递归求和
```JavaScript
function sum(arr) {
   if(_.isEmpty(arr)) {
      return 0;
   }
   return _.first(arr) + sum(_.rest(arr));//_.first获取的是第一个值 _.rest是剩下的值
}
sum([]); //-> 0
sum([1,2,3,4,5,6,7,8,9]); //->45
```

尾递归的递归求和
```JavaScript
function sum(arr, acc = 0) {
   if(_.isEmpty(arr)) { 
      return 0;
   }
   return sum(_.rest(arr), acc + _.first(arr));
}
```

元数：函数所接受的参数数量，也被称为函数的长度。

柯里化：柯里化是一种在所有参数被提供之前，挂起或“延迟”函数执行，将多个参数转化为一元函数序列的技术。
如一个三个参数的柯里化函数定义：`curry(f) :: ((a,b,c) -> d) -> a -> b -> c -> d`。

一个二元柯里化的实现：
```JavaScript
function curry2(fn) {
     return function(firstArg) {
          return function(secondArg) {
              return fn(firstArg, secondArg);
          };
     };
}

function add (a,b){
    return a + b;
}
var curry2AddFn = curry2(add);
curry2AddFn(1)(2);// 3
```

多元柯里化实现：
```JavaScript
function curry(fn, ...args) {
    const length = fn.length
    let lists = args || []
    let listLen
    return function (..._args) {
        lists = [...lists, ..._args]
        listLen = lists.length
        if (listLen < length) {
            const that = lists
            lists = []
            return curry(fn, ...that)
        } else if (listLen === length) {
            const that = lists
            lists = []
            return fn.apply(this, that)
        }
    }
}
```

应用部分：应用部分是一种通过将函数的不可变参数自己初始化为固定值来创建更小元数函数的操作。就比如一个5个参数的函数我们通过应用部分可以定义为一个给定了2个特定参数的函数，那么调用的时候只要给另外三个就行了。

应用部分的实现：
```JavaScript
function partial() {
    let fn = this, boundArgs = Array.prototype.slice.call(arguments);
    let placeholder = <<partialPlaceholderObj>>;// <<partialPlaceholderObj>> 是一个占位符 通常用undefined lodash使用的是_   
    let bound = function() {
        let position = 0, length = args.length;
        let args = Array(length);
        for (let i = 0; i < length; i++) {
            args[i] = boundArgs[i] === placeholder
                ? arguments[position++] : boundArgs[i];
        }
        while (position < arguments.length) {
            args.push(arguments[position++]);
        }
        return fn.apply(this, args);
    };
    return bound;
});
```

实战1：使用lodash的应用部分对核心语言扩展。
```JavaScript
// 注意lodash中的占位符是_，也就是_.partial参数中的_会在调用时替换为调用时的参数
// 获取字符串前几个子串
String.prototype.first = _.partial(String.prototype.substring, 0, _);
'Functional Programming'.first(3); // -> 'Fun'
// 将名字转化为[Last, First]格式
String.prototype.asName = 
    _.partial(String.prototype.replace, /(\w+)\s(\w+)/, '$2, $1');
'Alonzo Church'.asName(); //->  'Church, Alonzo'
// 实现类似于split的效果
String.prototype.explode = 
   _.partial(String.prototype.match, /[\w]/gi);
'ABC'.explode(); //->  ['A', 'B', 'C']
// 解析URL 
String.prototype.parseUrl = _.partial(String.prototype.match,
/(http[s]?|ftp):\/\/([^:\/\s]+)\.([^:\/\s]{2,5})/); 
'http://example.com'.parseUrl(); // -> [ 'http://example.com', 'http', 'example', 'com' ]
```

实战2：生成特定秒数的延迟函数。
```JavaScript
const Scheduler = (function () {
    // lodash中_也可用于_.bind中 表示占位符 
    // _.bind的第一个参数是要绑定的函数 第二个函数是宿主对象 之后的参数是绑定函数的参数 
    // 下例中两个占位符相当于都是setTimeout函数的参数 他的第一个参数是一个函数 第二个参数是毫秒数
    const delayedFn = _.bind(setTimeout, undefined, _, _);
    // 下面相当于把setTimeout第一个参数使用调用的函数 第二个参数也就是时间给5000 10000 或者 自己传进去
    return {
      delay5:  _.partial(delayedFn, _, 5000),
      delay10: _.partial(delayedFn, _, 10000),
      delay:   _.partial(delayedFn, _, _)
    };
})();

Scheduler.delay5(function () {
   consoleLog('Executing After 5 seconds!')
});
```

函数组合：函数组合是一种将已被分割的简单任务组织成复杂行为的整体过程。
定义如下：
```JavaScript
g :: A -> B //函数g输入A返回B
f :: B -> C //函数f输入B返回C

//那么f和g的组合 可以定义为一个函数输入f和g 生成一个可以输入A 直接变成C的函数
f ● g = f(g) = compose :: ((B -> C), (A -> B)) -> (A -> C)
```

组合的实现：
```JavaScript
function compose(/* fns */) {
   let args = arguments;
   let start = args.length - 1;
   return function() {
      let i = start;
      let result = args[start].apply(this, arguments);
      while (i--)
          result = args[i].call(this, result);
      return result;
   };
}
```

identity（I-组合子）：返回和参数相同的组合子。
```JavaScript
// identity :: (a) -> a
function identity(value) {
    return value;
}
```
注意：这里的组合子只写了单纯的一层的实现，实际使用的时候都是柯里化后的结果。就比如identity组合子其实是`R.curry(identity)`，柯里化后的组合子操作起来更方便。


tap（K-组合子）：将没有函数返回值的函数返回输入值。
```JavaScript
// tap :: (a -> *) -> a -> a
var tap = function tap(fn, x) {
  fn(x);
  return x;
}
```

alt（OR-组合子）：如果第一个函数返回有值，那么就返回第一个函数的返回值否则返回第二个参数的返回值。
```JavaScript
const alt = function (func1, func2) {
    return function (val) {
       return func1(val) || func2(val);
    }
};

//使用Ramda的实现
const alt = (func1, func2, val) => func1(val) || func2(val);
```

seq（S-组合子）：两个或者多个函数作为参数并返回一个新的函数，会用相同的值顺序调用所有的这些函数。
```JavaScript
const seq = function(/*funcs*/) {
    const funcs = Array.prototype.slice.call(arguments);
    return function (val) {
       funcs.forEach(function (fn) {
          fn(val);
       });
    };
};
```

fork（join-组合子）：需要三个函数作为参数，即以一个join函数将两个fork函数的处理结果再次进行处理。
```JavaScript
const fork = function(join, func1, func2){
   return function(val) {
      return join(func1(val), func2(val));
   };
};
```

函数式编程空值的处理：Functor和Monad。
函数式编程对空值的处理通常不是用`try-catch`和判断是否为空来处理，它的处理方式通常是在外面包一层数据结构。类似与jQuery处理DOM元素一样，会包装一层jQuery对象，这样如果没有找到DOM元素处理起来也不会报错。

Functor（函子）是一个可以将函数应用到它包裹的值上，并将结果再包裹起来的数据结构。
```JavaScript
class Wrapper {  
    constructor(value) {
        this._value = value; 
    }
    // map :: (A -> B) -> A -> B 
    map(f) { 
        return f(this._value);
    };

    toString() {
        return 'Wrapper (' + this._value + ')';
    }
}

// wrap :: A -> Wrapper(A)
const wrap = (val) => new Wrapper(val);

// fmap :: (A -> B) -> Wrapper[A] -> Wrapper[B] 
// 这个地方其实就是Functor
Wrapper.prototype.fmap = function (f) {
    return wrap(f(this._value));
};

const wrappedValue = wrap('Get Functional');//将字符串包裹起来
// 还记得前面说的组合子identity吗 就是这么使用的 这里可以获取到被包装的内容 
wrappedValue.map(R.identity); // 'Get Functional'
// 也可以做其他处理
wrappedValue.map(console.log); 
wrappedValue.map(R.toUpper); //-> 'GET FUNCTIONAL'

//使用fmap
const plus = R.curry((a, b) => a + b);
const plus3 = plus(3);
const two = wrap(2);
const five = two.fmap(plus3); //-> Wrapper(5)
five.map(R.identity); //-> 5

const plus10 = plus(10);
const fifteen = two.fmap(plus3).fmap(plus10); //-> Wrapper(15)
fifteen.map(R.identity);//-> 15
```

Functor的局限性：使用compose组合包装函数后会有多层包装结构，也就是需要多个`.map(R.identity)`来抽出结果，比较麻烦。可以使用Monad来处理。

```JavaScript
class Wrapper {
    constructor(value) {  
        this._value = value;
    }

    // Wrapper.of其实就是创建对象
    static of(a) {  
        return new Wrapper(a);
    }

    map(f) {  
        return Wrapper.of(f(this._value));
    }

    // 递归抽离值
    join() {  
        if(!(this._value instanceof Wrapper)) {
            return this;
        }
        return this._value.join();
    }

    get() {
        return this._value;
    }

    toString() {  
        return `Wrapper (${this._value})`;
    }
}

//简单使用
var msg = Wrapper.of('Hello Monads!')
   .map(R.toUpper)
   .map(R.identity); //-> Wrapper('HELLO MONADS!')
// 无论多少层只要调用.join就会返回最后一层
msg.join();//-> Wrapper('HELLO MONADS!')
msg.join().get();//-> 'HELLO MONADS!'
```
Maybe Monad用来处理是否为空的判断逻辑。它有2个具体的类型：Just和Nothing。
>Just(value)表示有值时的容器。
>Nothing()表示没有值时的容器。

```JavaScript
class Maybe {
    static just(a) {
        return new Just(a);
    }
    static nothing() {
        return new Nothing();
    }
    static fromNullable(a) {
        return a !== null ? Maybe.just(a) : Maybe.nothing();
    }
    static of(a) {
        return just(a);
    }
    get isNothing() {
        return false;
    }  
    get isJust() {
        return false;
    }
}
class Just extends Maybe {  
    constructor(value) {
        super();
        this._value = value;
    }

    get value() {
        return this._value;
    }

    map(f) {
        return Maybe.fromNullable(f(this._value));  
    }

    getOrElse() {
        return this._value;  
    }

    filter(f) {
        return Maybe.fromNullable(f(this._value) ? this._value : null);
    }

    chain(f) {
        return f(this._value);
    }

    toString () { 
        return `Maybe.Just(${this._value})`;
    }
}
class Nothing extends Maybe {
    map(f) {
        return this; 
    }
    get value() {
        throw new TypeError("Can't extract the value of a Nothing.");  
    } 
    getOrElse(other) {
        return other;
    }  
    filter(f) {
        return this._value;  
    }

    chain(f) {
        return this;
    }
    
    get isNothing() {
        return true;
    }
    toString() { 
        return 'Maybe.Nothing';
    }
}

//看完上面估计你也懵了 看一下使用你就会瞬间明白
Maybe.fromNullable("abc").map(r => r.toUpperCase()).getOrElse("不能为空");//-> "ABC"
Maybe.fromNullable(null).map(r => r.toUpperCase()).getOrElse("不能为空");//-> "不能为空"
```

Either Monad用来或的判断逻。它也有2个具体的类型：Left和Right。
>Left(a)包含一个可能的错误消息或抛出的异常对象。
>Right(b)包含一个成功值。

```JavaScript
class Either { 
    constructor(value) {
        this._value = value;
    }
    get value() {
        return this._value;
    }
    static left(a) {
        return new Left(a); 
    }
    static right(a) {
        return new Right(a);
    }
    static fromNullable(val) { 
        return val !== null && val !== undefined ? Either.right(val) : Either.left(val);
    }

    static of(a) {  
        return Either.right(a);
    }
}
class Left extends Either {
    map(_) {
        return this; // noop
    }
    get value() {  
        throw new TypeError("Can't extract the value of a Left(a).");
    }
    
    // 提取right的值
    getOrElse(other) { 
        return other;
    }

    //对left操作 不对right操作
    orElse(f) {
        return f(this._value);  
    }

    chain(f) {
        return this; 
    }
    getOrElseThrow(a) {
        throw new Error(a);
    } 
    filter(f) {
        return this; 
    }
    toString() {
        return `Either.Left(${this._value})`;
    }
}
class Right extends Either {
    map(f) {   
        return Either.of(f(this._value));
    }
    // 提取right的值
    getOrElse(other) {
        return this._value;  
    }

    //对left操作 不对right操作
    orElse() {
        return this; 
    }

    chain(f) {   
        return f(this._value);
    }
    getOrElseThrow() {
        return this._value;
    }

    filter(f) {   
        return Either.fromNullable(f(this._value) ? this._value : null);
    }

    toString() {
        return `Either.Right(${this._value})`;
    }
    
}

// 看不懂吧 那就再看一个例子，给一个数字取绝对值，如果小于0那么返回它的相反数 否则返回这个数字：
function isLT0(num){
	if(num >= 0){
        return Either.of(num);// of其实就是right
    } else {
        return Either.left("小于0");// left说明是小于0的
    }
}
// right的话 不会执行orElse里面的函数
isLT0(1).orElse(val=>Either.of(-val)).value;// 1
isLT0(-1).orElse(val=>Either.of(-val)).value;// 1
```

IO Monad用来处理不纯的函数。

```JavaScript
class IO {
   constructor(effect) {
      if (!_.isFunction(effect)) {
         throw 'IO Usage: function required';
      }
      this.effect = effect;
   }
   static of(a) {
      return new IO( () => a ); 
   }
   static from(fn) {
      return new IO(fn);   
   } 
   map(fn) {
      var self = this;
      return new IO(function () {
        return fn(self.effect());
      });
   }
   chain(fn) { 
        return fn(this.effect());
   }
   run() { 
        return this.effect();
   }
}

// 这时你特别懵逼 同样来一个例子
// read和write是不纯的函数 操作DOM了 有副作用
const read = function (document, id) {
    return function () {
       return document.querySelector(`\#${id}`).innerHTML;
    };
};

const write = function(document, id) {
   return function(val) {
     return document.querySelector(`\#${id}`).innerHTML = val;
   };
};

// 还记得之前的应用部分吗
const readDom = _.partial(read, document);
const writeDom = _.partial(write, document);

// 现在加入有DOM结构：<div id="student-name">alonzo church</div>
const changeToStartCase = 
    IO.from(readDom('student-name')).
           map(_.startCase).
           map(writeDom('student-name'));
//最后执行不纯的函数 调用后DOM结构变成了：<div id="student-name">Alonzo Church</div>
changeToStartCase.run();
```

记忆化（memoization）：将函数的计算结果保存起来，如果下次传入相同的参数那么就直接返回结果。
```JavaScript
Function.prototype.memoized = function () {// 记忆化函数
    let key = JSON.stringify(arguments);
    this._cache = this._cache || {};
    this._cache[key] = this._cache[key] || 
            this.apply(this, arguments);
    return this._cache[key];
};
Function.prototype.memoize = function () {// 激活记忆化
    let fn = this;
    if (fn.length !== 1){ //假设这里只记忆化一元函数 如果多元函数会有如何做呢 你可以考虑一下
        return fn;
    }
    return function () { 
        return fn.memoized.apply(fn, arguments);
    };
};

//使用记忆化：
//定义一个斐波拉契函数
const factorial = ((n) => (n === 0) ? 1 
         : (n * factorial(n - 1)));

factorial = factorial.memoize();//激活记忆化
factorial(10);//首次会计算
factorial(10);//第二次直接使用计算后的值
```

上述斐波拉契函数使用了递归会有较高的空间使用率可以使用尾递归来优化：
```JavaScript
const factorial = (n, current = 1) =>
    (n === 1) ? current :
    factorial(n - 1, n * current);
```

最后我们简单的用Promise封装一下AJAX作为本篇文章的结束：
```JavaScript
var getJSON = function (url) {
    return new Promise(function(resolve, reject) {
        let req = new XMLHttpRequest();
        req.responseType = 'json';
        req.open('GET', url);
        req.onload = function() {
            if(req.status == 200) {
               let data = JSON.parse(req.responseText);
               resolve(data);
            }
            else {
               reject(new Error(req.statusText));
            }
        };
        req.onerror = function () {
           if(reject) {
              reject(new Error('IO Error'));
           }
        };
        req.send();
    });     
};
//使用
getJSON('/students').then(
    function(students) {
        console.log(R.map(student => student.name, students));
    },
    function (error) {
        console.log(error.message);
    }
);
```