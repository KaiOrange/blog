---
title: JavaScript易错点（长期更新）
date: 2019-04-08 14:11:11
author: Orange
tag:
	- 易错点
	- 面试题
categories: JavaScript
---

### 下面输出的是什么 ###

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

### 下面输出的是什么 ###

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

### 下面输出的是什么 ###

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

### 下面输出的是什么 ###

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

### 下面输出的是什么 ###

```JavaScript
var a = {n:1};
var b = a;
a.x = a = {n:2};
console.log(a.x);
console.log(b.x);
```

答案：
> undefined
> {n: 2}

点评:
**执行第三行那个等式的时候，a.x先进入栈，此时a和b应该是一样的。之后后面那个等式进栈并执行，后面的结果把a改了，也就是a变成{n:2}了，返回的结果也是{n:2}。此时前面的a.x的地址就是b.x的地址，所以b.x = {n:2}。**

### 下面输出的是什么 ###

```JavaScript
console.log(Number());
console.log(Number(undefined));
console.log(Number(null));
console.log(Number("012"));
console.log(Number("abc"));
console.log(Number({valueOf:()=>123}));
console.log(Number({toString:()=>456}));
console.log(Number({valueOf:()=>123,toString:()=>456}));
```

答案：
> 0
> NaN
> 0
> 12
> NaN
> 123
> 456
> 123

点评:
**Number转换的时候不传值和传入null的时候是0；如果是undefined的时候然后的是NaN；字符串会忽略前置的0（而不是8进制）；不以数字开头的是NaN；对象会调用valueOf()方法，如果结果用Number转化后还是NaN，那么就会用toString()的结果再转换一次。**

### 下面输出的是什么 ###

```JavaScript
console.log(parseFloat("0xA"));
console.log(parseInt("0xA"));
console.log(parseInt("012"));
```

答案：
> 0
> 10
> 12

点评:
**parseFloat对于16进制的都换转化为0，parseInt对0开头的都会忽略（ES3的时候是按照8进制转换的）。**

### 下面输出的是什么 ###

```JavaScript
console.log(Number.POSITIVE_INFINITY + Number.POSITIVE_INFINITY);
console.log(Number.POSITIVE_INFINITY + Number.NEGATIVE_INFINITY);
console.log(Number.NEGATIVE_INFINITY + Number.NEGATIVE_INFINITY);
console.log(1 + NaN);
```

答案：
> Infinity
> NaN
> -Infinity
> NaN

点评:
**正无穷加正无穷等于正无穷，负无穷加负无穷等于负无穷，正无穷加负无穷不是个数，不是个数加其他数任然不是个数。**

### 下面输出的是什么 ###

```JavaScript
console.log(NaN < 0);
console.log(NaN == 0);
console.log(NaN > 0);
console.log(NaN = 0);
console.log(0 = 0);
```

答案：
> false
> false
> false
> 0
> 报错：Uncaught SyntaxError: Invalid left-hand side in assignment

点评:
**NaN和任何数字比较都是false。最后一个相当于是赋值操作，会返回0但是，NaN的值并不会改变，如果一个数字赋值为另一个数字则会报错。**

### 下面输出的是什么 ###

```JavaScript
var d = (a = 1,b = 2,c = 3);
console.log(d);
```

答案：
> 3

点评:
**逗号表达式返回最后一个。**

### 下面输出的是什么 ###

```JavaScript
console.log(123 instanceof Number);
```

答案：
> false

点评:
**123的数据类型是number而不是object，所有不是对象的数据类型使用instanceof都返回false。**

### 下面输出的是什么 ###

```JavaScript
console.log(new Array(3,2,1));
console.log(new Array(3));
```

答案：
> [3, 2, 1]
> [undefined, undefined, undefined]

点评:
**new Array的时候多个参数的时候会认为是数组的内容，一个参数的时候会认为是数组的长度。后一个有的浏览器也会打印`[empty × 3]`，其中每一个值都是undefined。**

### 下面输出的是什么 ###

```JavaScript
function F1 (){
  return 123;
}
function F2 (){
  return {name:"不告诉你"};
}

function F3 (){
  return this;
}
console.log(new F1());
console.log(new F2());
console.log(new F3());
```

答案：
> F1 {}
> {name: "不告诉你"}
> F3 {}

点评:
**new的时候如果构造方法返回的是一个对象，那么new的结果就是这个对象，否则创建一个对象，新创建的对象的原型指向构造方法的原型。**

### 下面输出的是什么 ###

```JavaScript
function fn (){
  try{
    return 0;
    throw new Error("我就要抛出错误");
  } catch (e){
    return 1;
  } finally {
    return 2;
  }
}

console.log(fn());
```

答案：
> 2

点评:
**finally一定会执行，即使有return也阻止不了。**
### 实现如下效果 ###

```JavaScript
// 调用eat()的时候打印eat 调用work()的时候打印work 调用sleep的时候休息对应的秒数
let paint = new Paint()
paint.eat().work().sleep(3).eat().work()
```

答案1（同步阻塞式）：

```JavaScript
class Paint {

  eat() {
    console.log('eat')
    return this
  }

  work() {
    console.log('work')
    return this
  }

  sleep(t) {
    let date = +new Date()

    while (+new Date() - date < t * 1000) {

    }

    console.log('sleep')

    return this
  }
}

let paint = new Paint()
paint.eat().work().sleep(3).eat().work()
```

点评:
**同步阻塞的时候，使用sleep则不会执行其他的代码，面试官看到这会直接让你改成异步的，异步的一种实现如下：**

答案2（Promise链式调用）：

```JavaScript
class Paint {

  constructor() {
    this.chain = Promise.resolve()
  }

  eat() {
    this.chain = this.chain.then(()=>{
      console.log('eat')
    })

    return this
  }

  work() {
    this.chain = this.chain.then(()=>{
      console.log('work')
    })
    return this
  }

  sleep(t) {
    this.chain = this.chain.then(()=>{
      return new Promise(resolve => {
        setTimeout(() => {
          console.log('sleep')
          resolve()
        }, t * 1000);
      })
    })

    return this
  }
}

let paint = new Paint()
paint.eat().work().sleep(3).eat().work()
```

点评:
**这里使用了Promise来做异步操作，每次使用上一个Promise的then返回的Promise作为新的Promise，代码简单。不出意外的话面试官又会问，如果不使用Promise怎么实现呢？**

答案3（自己调用法）：

```JavaScript
class Paint {

  constructor() {
    this.fns = []
    setTimeout(() => {
      this.next()
    });
  }

  next() {
    let fn = this.fns.shift()
    fn && fn()
  }

  eat() {
    this.fns.push(() => {
      console.log('eat')
      this.next()
    })

    return this
  }

  work() {
    this.fns.push(() => {
      console.log('work')
      this.next()
    })
    return this
  }

  sleep(t) {
    this.fns.push(() => {
      setTimeout(() => {
        console.log('sleep')
        this.next()
      }, t * 1000);
    })

    return this
  }
}

let paint = new Paint()
paint.eat().work().sleep(3).eat().work()
```

点评:
**这个代码最重要的就是在构造方法使用宏任务去调用`this.next()`，保证第一次可以正常调用，如果`paint.eat().work().sleep(3).eat().work()`也在宏任务中则不会执行，这是需要手动去调用`this.next()`**
