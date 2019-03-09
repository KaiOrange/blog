---
title: ES5面向对象基础
date: 2019-03-03 16:06:29
author: Orange
tags:
  - ES5对象
  - 面向对象
  - 原型
  - OOP
categories: JavaScript
---

面向对象的知识时JS中的一个比较重要的概念，我们今天学习一下ES5面向对象的基础内容。

## 一、 创建对象 ##
   
1. 工厂模式
```JavaScript
function createPerson(name){
    var o = new Object();
    o.name = name;
    o.sayName = function(){
        console.log(this.name);
    };    
    return o;
}

var person1 = createPerson("Orange");
```
缺点：无法辨别是一个对象。

2. JSON对象
```JavaScript
var person1 = {
    name:"Orange",
    sayName:function (){
        console.log(this.name);
    }
};
```
优点：简单。
缺点：每次只能创建一个对象，代码无法复用。

3. 构造函数
```JavaScript
function Person(name){
    this.name = name;
    this.sayName = function(){
        console.log(this.name);
    };    
}

var person1 = new Person("Orange");

person1.sayName();   //"Orange"
```
优点：可以创建多个对象，可以辨别是对象。
下面我们主要讨论的也正是使用构造方法创建的对象。

## 二、 不使用new关键字会发生什么 ##

不使用new的时候相当于时全局变量window调用该方法，this会绑定在全局变量上。由于没有返回值，结果是undefined。
```JavaScript
function Person(name){
    this.name = name;// 不使用new时 非严格模式下绑定在全局变量window上了
}
var person1 = Person("Orange");// 方法的调用
console.log(person1);// undefined
```

## 三、 new一个对象的时候有返回值怎么办 ##

如果返回的是一个对象，那么new出来的结果就是这个对象；如果返回的是非对象的，那么new返回的与没有return语句一样，是一个该类的实例对象。如果没有new的时候，就比如上面这种情况，那就是方法返回什么结果就是什么了。
```JavaScript
function Person1(){
    this.name = "Person1";
    return {haha:"我是一个新的对象"};// 返回一个对象
}
function Person2(){
    this.name = "Person2";
    return 123;// 返回一个非对象
}
var person1 = new Person1();
var person2 = new Person2();
console.log(person1);// {haha: "我是一个新的对象"}
console.log(person2);// Person2 {name: "Person2"}
```

## 四、 成员方法 ##

1. 给单个对象添加成员方法
```JavaScript
function Person(){
}

var person1 = new Person();
person1.name = "Orange";
var person2 = new Person();
console.log(person1.name);// "Orange"
console.log(person2.name);// undefined
```

2. 给多个对象添加成员方法
```JavaScript
function Person(name){
    this.name = name;//所有的对象公用的属性
    this.age = 20;//所有的对象公用的属性
}

var person1 = new Person("Orange");
var person2 = new Person("小明");
person1.age = 21;
console.log(person1.name);// "Orange"
console.log(person2.name);// "小明"
console.log(person1.age);// 21
console.log(person2.age);// 20
```

## 五、 私有变量 ##

构造函数中var声明的变量是私有变量。
```JavaScript
function Person(){
    var age = 21;//这里相当于私有变量
}

var person1 = new Person();
console.log(person1.age);// undefined
```

## 六、 静态方法 ##

添加到构造函数上的方法是静态方法，添加到构造函数上的变量是静态变量。
```JavaScript
function Person(name){
    this.name = name;
}

Person.age = 20;//静态变量
Person.name = "骗你的"; // 这条语句会忽略 因为name是一个特殊的属性 不能修改
Person.sayName = function (){//静态方法
    console.log("sayName:" + this.name);
};
var person = new Person("Orange");
console.log(person.name);// "Orange"
console.log(Person.name);// "Person" 这里是类的名称 哈哈
// console.log(person.name);// 这个会报错 静态属性属于类 而不是属于对象 
// person.sayName(); // 这个会报错 静态方法属于类 而不是属于对象
console.log(Person.age); // 20
Person.sayName();// sayName:Person
```

## 七、 原型 ##

上面说过给多个对象添加成员方法，只要在构造函数中添加`this.方法名 = 方法`即可，但是这样会出现一个问题就是不同对象的方法是不同的，这样就会增大内存的开销。解决这个问题的办法就是把方法放在函数的外面，然后在函数内部去引用同一个函数。这样解决了这个问题，但是却失去了封装性。解决这个问题的最终办法就是——原型。

每一构造函数写完以后，引擎会加原型的委托，就比如上面的Person类（函数）**定义**完了以后，引擎会加：
```JavaScript
Person.prototype = new Object();
```
从上面代码可以看出Person加了一个名叫`prototype`的静态变量，这个变量就是Person的原型。由于对象是无法访问静态变量的，所以浏览器给每一个对象又加了一个`__proto__`的属性也指向了这个原型。相当于引擎又执行了下面的代码：
```JavaScript
person.__proto__ = Person.prototype;
```
我们这里总结一下：**`对象.__proto__属性` 和 `构造函数.prototype属性` 都指向了该类的原型**。
下面我们把这剪不断理还乱的原型画一张图吧：
![prototype示意图](1.png)

由上图可知，原型对象有一个`constructor`的属性指向了构造方法。也就是：
```JavaScript
Person.prototype.constructor === Person;// true
person.__proto__.constructor === Person;// true
```
由上面`Person.prototype = new Object();`可知`Person.prototype`其实是Object的对象，既然是对象那么就有`__proto__`属性指向该对象的原型。也就是说：
```JavaScript
Person.prototype.__proto__ === Object.prototype;// true
```
其实`Object.prototype`也是一个对象那么他的原型是什么呢？我们可以打印一下发现他的原型是`null`，上图也可以看出。
```JavaScript
console.log(Object.prototype.__proto__);// null
```

说了这么一大堆终于知道了原型是什么了，那么还有一个更重要的东西就是原型链。
如果一个对象调用自己没有定义的属性，那么他就会从他们原型中查找，看有没有定义该属性，如果原型中没有就会去原型的原型去寻找，一直找到顶层的Object类的对象（最顶层的null不用找了，肯定没有），这条由原型连起来的链条叫做原型链。

那我们看一个东西，上面`person.constructor`是什么呢？其实就是`Person`函数。因为`person`对象没有`constructor`属性，所以去`person`的原型中找也就是`person.__proto__`而它里面找到了，指向的就是`Person`函数。

我们也可以用原型来定义对象的属性和方法。
```JavaScript
function Person(){
}

Person.prototype.name = "Orange";
Person.prototype.sayName = function(){
    console.log(this.name);
};

var person1 = new Person();
var person2 = new Person();

person2.name = "小明";
person1.sayName();// "Orange"
person2.sayName();// "小明"
```
我们来看一下这个步骤，`person1`调用`sayName`的时候由于`person1`自己没有`sayName`这个方法，那么就是去它的原型去找也就是`Person.prototype`，发现有这个方法，那么就调用，而方法中`this.name`，由于自己并没有`name`这样一个属性，也会在原型中找，最后找到了是"Orange"。`person2`找`sayName`跟之前的是一样的，但是`person2`有`name`这个属性，所以就不需要去原型链中找了，该属性的值是"小明"。