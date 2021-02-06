---
title: ES5中的继承
date: 2019-03-04 21:33:35
author: Orange
tags:
  - 继承
  - 原型
categories: JavaScript
---

面向对象的三大特性是：封装、继承、多态。其中继承是最难理解的，也是最重要的部分。
JS中本身没有专门继承的语法，它是使用各种代码的模拟来实现的。即使ES6有了正真的继承语法，其本质也是ES5中继承的语法糖。目前ES5继承最被人津津乐道的就是尼古拉斯的著名书籍《JavaScript高级程序设计》中记录的6中方法。本文也是摘自这本本书的这部分的核心内容，并整理给大家呈现出来。

1. 原型链继承
    原型链继承是最为经典的一种继承，其继承方式就是**子类的原型指向父类的实例**。下面我们来看一个这种继承的例子：
    ```JavaScript
    function Person(name){
        this.name = name;
        this.hobbies = ["coding","running"];
    }

    Person.prototype.sayName = function(){
        console.log("我是：" + this.name);
    };

    function Man(name){
        this.name = name;
    }

    Man.prototype = new Person();//原型继承

    var lufei = new Man("海贼王的男人");
    lufei.sayName();// 我是：海贼王的男人
    ```
    我们可以看到子类的对象`lufei`已经拥有父类的方法，说明继承成功了。上面最重要的一行代码是第14行，印证了**子类的原型指向父类的实例**。原型继承其实就是利用原型链来实现的，如果在子类中没有找到某个属性和方法就会去子类的原型中去找，也就是父类的实例，如果父类的实例中也没有找到，又会去父类的原型去找，直到找到Object的原型为止。
    原型继承是最简单最长用的一种继承方式，但是它有自己的缺点：

    > **缺点1：父类中引用类型的属性，会被子类共享。**
    如上例中的hobbies属性，每个子类的实例都指向了同一个hobbies属性。如果某个子类不重写hobbies并且给他添加了一个值，那么所有的没有重写hobbies的子类的这个值都将会改变（同一个对象）。
    > **缺点2：创建子类的时候，无法调用父元素的构造函数。**
    如上例中的`this.name = name;`在父类中已有相同的代码无法做到复用。

2. 借用构造函数实现继承
    借用构造函数实现的继承是解决原型继承的缺点而出现的，他的核心思想就是**子类通过call（或者apply）调用父类的构造函数**。请看下面的例子：
    ```JavaScript
    function Person(){
        this.hobbies = ["coding","running"];
    }

    function Man(){
        Person.call(this); // 借用构造函数的继承
    }

    var lufei = new Man();
    var nami = new Man();
    lufei.hobbies.push("eat meat");

    console.log(lufei.hobbies); // ["coding", "running", "eat meat"]
    console.log(nami.hobbies); // ["coding", "running"]
    ```
    右上可知，子类的两个对象`lufei`和`nami`都拥有了父类的属性，所以继承成功。我们可以看到子类可以调用父类的构造方法，同时父类的引用属性也不再共享。
    这种方法的缺点：
    > **缺点1：父类原型中的属性和方法无法继承。**
    > **缺点2：对每个子类对象来说，父类中的函数属性都是不同的函数，代码无法复用。**

3. 组合继承
    组合继承又称为伪经典继承，他的核心思想就是**原型继承和借用构造函数的继承合二为一**。请看下面的例子：
    ```JavaScript
    function Person(name){
        this.name = name;
        this.hobbies = ["coding","running"];
    }
    Person.prototype.sayName = function (){
        console.log("我是：" + this.name);
    }

    function Man(name){
        Person.call(this,name); // 借用构造函数的继承
        //这里可以写其他的子类独有的属性
    }

    Man.prototype = new Person();// 原型继承部分
    Man.prototype.constructor = Man;// 修复构造器的指向

    var lufei = new Man("路飞");
    var nami = new Man("娜美");
    lufei.hobbies.push("eat meat");

    console.log(lufei.hobbies); // ["coding", "running", "eat meat"]
    console.log(nami.hobbies); // ["coding", "running"]

    //子类拥有父类原型上的方法
    lufei.sayName(); // 我是：路飞
    nami.sayName(); // 我是：娜美

    // 父类的属性方法可以复用
    console.log(lufei.sayName === nami.sayName);// true
    ```
    由上可知，子类的两个对象`lufei`和`nami`都拥有了父类的属性，所以继承成功。组合继承是最常用的继承方式之一，但是我们可以看到子类可以调用父类的构造方法，同时父类的引用属性也不再共享。

    这里需要注意一点就是第15行代码`Man.prototype.constructor = Man;`，在第14行代码中`Man.prototype = new Person();`那么`Man.prototype.constructor`就相当于是`new Person().constructor`，Person对象的`constructor`也就是`Person`构造函数，这里如果Man对象的`constructor`指向`Person`很显然是不合适的，所以需要`Man.prototype.constructor = Man;`来显示的把`Man`的构造函数指向`Man`。

    > **缺点：调用了两次父类构造函数，比较消耗内存。**
    一次在第10行，一次再第14行。

4. 原型式继承
    要解决组合继承的缺点，我们不得不先说一下原型式继承，它是道格拉斯提出的一种继承方式，其核心思想就是**借助原型，用已有的对象创建对象。**。请看下面的例子：
    ```JavaScript
    function object(o){// 通过原型创建对象的方法
        function F(){}
        F.prototype = o;
        return new F();
    }
    var person = {
        name: "人",
        sayName: function (){
            console.log("我是：" + this.name);
        }
    };

    var lufei = object(person);
    lufei.name = "路飞";
    lufei.sayName();// 我是：路飞
    ```
    右上可知，子类的对象`lufei`拥有了父类的方法，继承成功。但是我们每次得自己写一个类似于上面的`object`方法。ES5考虑到这个问题，把这个方法规范化了，就是大名鼎鼎的`Object.create()`方法，其本质就是上面的`object`函数。这个函数接受2个参数，一个是要复制的对象，一个是`Object.defineProperties()`函数第二个参数相同的结构。所以上面第13行和第14行可以改写为：
    ```JavaScript
    var lufei = Object.create(person,{
        name : {//这个对象是属性描述符里面那样的对象
            value:"路飞"
        }
    });
    ```
    这种方式比较方便，它跳过了创建子类这一步，直接创建了子类对象。
    > **缺点1：子类自己独特的属性或方法，是无法复用的。**
    > **缺点2：没有子类的概念，直接创建了子类对象。**

5. 寄生式继承
    寄生式继承解决了子类对象拥有自己的属性和方法的问题，其核心思想就是**在原型式继承的外面再包装一层，使得返回的对象可以添加自己的属性和方法。**。下面这个例子我们直接使用ES5的`Object.create`了，你可以理解成原型式继承里面的`object`函数：
    ```JavaScript
    var person = {
        name: "人",
        sayName: function (){
            console.log("我是：" + this.name);
        }
    };

    function createObject(obj){// 创建子类对象一个方法
        var newObj = Object.create(obj);// 原型式继承
        newObj.sayHello = function (){ // 这里给每个子对象添加方法
            console.log("大家好！！！")
        }
        // ... 这里可以添加其他的属性或方法
        return newObj;
    }

    var lufei = createObject(person);
    lufei.name = "路飞";
    lufei.sayName();// 我是：路飞
    lufei.sayHello();// 大家好！！！

    var nami = createObject(person);
    nami.name = "娜美";
    nami.sayName();// 我是：娜美
    nami.sayHello();// 大家好！！！
    ```
    由上可知，子类的对象`lufei`和`nami`即拥有了父类的方法也拥有了子类自己独特的方法`sayHello`，继承成功。但是它也是直接创建了子对象的。
    > **缺点：没有子类的概念，直接创建了子类对象。**
6. 寄生组合式继承
    寄生组合式过借用构造函数来继承属性，通过原型链的混成形式来继承方法。其核心思想就是**使用寄生式继承来继承父类的原型，然后再将结果指定给子类的原型；子类的构造函数借助构造函数来继承父类。**。请看下面的例子：
    ```JavaScript
    function inheritPrototype(subType, superType){
        var prototype = Object.create(superType.prototype); // 寄生式继承来继承父类的原型
        prototype.constructor = subType; // 修复子类构造函数的指向
        subType.prototype = prototype; // 修复子类原型的指向
    }

    function Person(){
        this.hobbies = ["coding","running"];
    }

    function Man(){
        Person.call(this); // 借助构造函数继承属性
    }

    inheritPrototype(Man, Person);

    var lufei = new Man();
    var nami = new Man();
    lufei.hobbies.push("eat meat");

    console.log(lufei.hobbies); // ["coding", "running", "eat meat"]
    console.log(nami.hobbies); // ["coding", "running"]
    ```
    寄生组合式继承被誉为引用类型最理想的继承方式，也是最重要的一种继承方式。
    > **缺点：除了代码比较多外，没有其他的缺点了！**
