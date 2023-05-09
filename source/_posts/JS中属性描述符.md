---
title: JS中属性描述符
date: 2019-03-03 12:11:33
author: Orange
tags:
  - 属性描述符
  - defineProperty
categories: JavaScript
---

## 属性描述符 ##

属性描述符是ES5中的一个重要的概念。它可以对对象做一些特定的高级操作，今天我们就学习一下ES5中的属性描述符。
ES5中的属性描述符是由`Object类`的一个静态方法`defineProperty`来设置的，该方法接收三个参数，分别是：**属性操作的对象、属性名和一个属性描述符的对象**。我们来看一个简单的例子：
```JavaScript
var obj = {
    a:"a"
};
Object.defineProperty(obj,"a",{
    value:"123"
});
console.log(obj.a);//123
```
这个例子中，我们使用属性描述符将对象obj的a属性的值设置为"123"。
属性描述符是由第三个参数来决定属性可以做哪些操作，这个对象可以设置以下的值：

描述符的值|描述|默认值
---|---|---
value|值|undefined
writable|是否可写|true
configurable|是否可配置|true
enumerable|是否可枚举|true
set|设置属性的函数|undefined
get|获取属性的函数|undefined

接下来我们一一简绍上面的这些值，由于`value`很简单，上面已经做过解释，就不再重复了。

1. writable
    writable表示是否可写，如果其值设置为`false`，那么修改时会静默失败，严格模式下，会报错TypeError。
    ```JavaScript
    var obj = {
        a:"a"
    };
    Object.defineProperty(obj,"a",{
        writable:false
    });
    obj.a = "123";//由于writable是false，这里会静默失败
    console.log(obj.a);//a
    ```
2. configurable
    configurable表示是否可配置，如果其值设置为`false`，那么将属性描述符重新设置的时候会报错TypeError（无论是否是在严格模式下）；同时`delete`该属性的时候会静默失败，严格模式会报错TypeError。
    ```JavaScript
    var obj = {
        a:"a"
    };
    Object.defineProperty(obj,"a",{
        configurable:false,
    });
    Object.defineProperty(obj,"a",{
        configurable:true,// 将configurable为false的重新开启会直接报错
        value:"111",
    });
    console.log(obj.a);
    ```
    下面给出一个delete的例子：
    ```JavaScript
    var obj = {
        a:"a"
    };
    Object.defineProperty(obj,"a",{
        configurable:false,
    });
    delete obj.a;// 这个地方会静默失败 严格模式下会报错
    console.log(obj.a);//"a"
    ```
    configurable有三点需要注意的：

    2.1 所谓的不可配置是不能修改，如果重新设置相同的属性描述符是不会报错的：

    ```JavaScript
    var obj = {
        a:"a"
    };
    Object.defineProperty(obj,"a",{
        configurable:false
    });
    Object.defineProperty(obj,"a",{
        configurable:false// 这个地方并不会报错 因为属性描述符并没有改变
    });
    console.log(obj.a);//"a"
    ```

    2.2 如果configurable为false的时候仍然可以把writable从true改成false，但是不能把writable从false修改成true。

    ```JavaScript
    var obj = {
        a:"a"
    };
    Object.defineProperty(obj,"a",{
        configurable:false,
        writable:true
    });
    Object.defineProperty(obj,"a",{
        writable:false // writable从true设置为false是可以的
    });
    obj.a = "b";// writable为false 静默失败
    console.log(obj.a);//"a"
    ```

    2.3 如果configurable为false并且writable从true的时候，那么修改value是可以的。

    ```JavaScript
    var obj = {
        a:"a"
    };
    Object.defineProperty(obj,"a",{
        configurable:false,
        writable:true,
        value:"111"
    });
    Object.defineProperty(obj,"a",{
        value:"222" // value其实是由writable来决定的
    });
    console.log(obj.a);//"222"
    ```

3. enumerable
    enumerable表示是否可枚举，如果设置为false，那么for-in中获取不到该值。
    ```JavaScript
    var obj = {
        a:"a",
        b:"b",
        c:"c"
    };
    Object.defineProperty(obj,"b",{
        enumerable:false
    });
    for (var key in obj) {
        console.log(obj[key]);// 依次打印"a" "c"
    }
    ```

    通常判断一个属性是否属于一个对象我们可以使用`in操作符`和`hasOwnProperty方法`，对于不可枚举的属性，他们返回的都是true，如上面的不可枚举的属性`b`：
    ```JavaScript
    console.log("b" in obj);// true
    console.log(obj.hasOwnProperty("b"));// true
    ```
    那么如何区分某个属性是不可枚举的呢？可以利用对象的`propertyIsEnumerable`方法。
    ```JavaScript
    console.log(obj.propertyIsEnumerable("b"));// false
    ```
    如果要获取对象的所有属性（键），那怎么办？可以使用下面两个方法：
    ```JavaScript
    console.log(Object.keys(obj));// 获取所有可枚举的属性 结果是 ["a", "c"]
    console.log(Object.getOwnPropertyNames(obj));// 获取所有的属性，不管是否可以枚举 结果是 ["a", "b", "c"]
    ```
4. set和get
    set和get通常是方法，分别定义了设置值和获取值是的逻辑，我们这里给出一个例子，当设置了一个数值读取的时候返回这个数值的平方：
    ```JavaScript
    var obj = {
    };
    Object.defineProperty(obj,"a",{
        set : function (_a){
            this._a = _a;//这个地方必须注意 这里使用的是_a而不是a 因为如果是a的话会陷入死循环
        },
        get : function (){
            return this._a * this._a;
        }
    });
    obj.a = 4;//这里会调用set方法
    console.log(obj.a);// 这里会调用get方法 打印16
    ```
    set和get也可以定义在对象上，而不使用属性描述符，如下：
    ```JavaScript
    var obj = {
        set a(_a){//这个地方和函数属性的写法有一点点的区别
            this._a = _a;
        },
        get a(){
            return this._a * this._a;
        }
    };
    obj.a = 4;//这里会调用set方法
    console.log(obj.a);// 这里会调用get方法 打印16
    ```
    那么问题来了，如果同一次设置属性描述符中既有get和set又有value那么会以哪个为准呢？这种情况下浏览器就会报错，也就是不允许这么做。
    如果多次设置同一个属性的属性描述符那么后面的会覆盖前面的。
    ```JavaScript
    var obj = {
        a:123
    };
    Object.defineProperty(obj,"a",{
        set :function (_a){
            this._a = _a;
        },
        get :function (){
            return this._a * this._a;
        },
    });
    obj.a = 4;
    console.log(obj.a);// 16

    Object.defineProperty(obj,"a",{
        writable:true,
        value:321
    });

    console.log(obj.a);// 321
    ```

## 三个方法 ##


### Object.preventExtensions ###

`Object.preventExtensions`表示禁止扩展，调用后不能给对象添加新的属性，如果添加了非严格模式下会静默失败，严格模式下会报错（TypeError）。

  ```JavaScript
  var obj = {
      a: 1
  };
  Object.preventExtensions(obj);
  obj.b = 12;
  console.log(obj); // 非严格模式下打印 {a: 1}
  ```

### Object.seal ###

`Object.preventExtensions`方法不能扩展，但是它可以删除属性。`Object.seal`是密封的意思，调用后不但不能扩展还不能删除而且不可配置。相当于在`Object.preventExtensions`的基础上标记了`configurable: false`。

  ```JavaScript
  var obj = {
      a: 1
  };
  Object.seal(obj);
  delete obj.b;
  console.log(obj); // 非严格模式下打印 {a: 1}
  ```

### Object.freeze ###

`Object.seal`后不可删除属性，但是可以修改属性。`Object.freeze`表示冻结，当冻结一个对象后，就无法修改对象的属性值了。相当于`Object.seal`的基础上标记了`writable: false`。

  ```JavaScript
  var obj = {
      a: 1
  };
  Object.freeze(obj);
  obj.a = 123;
  console.log(obj); // 非严格模式下打印 {a: 1}
  ```

注意`Object.freeze`冻结是潜冻结，如果某个属性是对象，那么该对象的属性值仍然可以修改，如下：

  ```JavaScript
  var obj = {
      a: {b:1}
  };
  Object.freeze(obj);
  obj.a.b = 2;
  console.log(obj); // 打印 {a: { b: 2 }}
  ```

一张图总结三者关系：

![三者关系](1.png)

## 补充 ##

1. 在调用`Object.defineProperty`方法创建一个**新的属性**的时候，如果不指定`writable`，`configurable`，`enumerable`的时候默认值是false，如果只是修改已定义的属性的时候那么就是默认值true。

    ```JavaScript
    var obj = {
        a:"111"
    };
    Object.defineProperty(obj,"a",{
        value:"a"
    });
    Object.defineProperty(obj,"b",{
        value:"b"
    });
    console.log(Object.keys(obj));//b是新的 所以是不可枚举的 所以打印["a"]
    ```

2. 获取属性描述符，可以使用`Object.getOwnPropertyDescriptor`方法。

    ```JavaScript
    Object.getOwnPropertyDescriptor(obj,"a");
    ```

3. 批量设置多个属性描述符的时候，可以使用`Object.defineProperties`方法。

    ```JavaScript
    Object.defineProperties(obj,{
        a:{value:"aaa",writable:false},
        b:{value:"bbb",writable:false},
    });
    ```
