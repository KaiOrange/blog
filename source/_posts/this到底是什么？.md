---
title: this到底是什么？
date: 2019-02-27 20:00:00
author: Orange
tags:
  - this
categories: JavaScript
---

`this`是JavaScript中的一个重要的概念，它的值并不是由声明的位置来决定的，而是由调用的位置来决定。正是因为这个原因在不同的语境下它的值是不一样的，所以它成了面试官最喜欢考察的内容。

通常`this`由下面这四条法则就可以确定：
1. new绑定，指向创建的对象。

    ```JavaScript
    function Student(name){
        this.name = name;
    }
    var s = new Student("小明");
    console.log(s.name);//小明
    ```

    通过`new`关键字创建的对象，那么构造方法中的`this`指向该对象。

2. call、apply、bind等显式绑定。
   
    ```JavaScript
    function sayName(){
        console.log(this.name);
    }
    var obj1 = {
        name : "小李"
    };
    var obj2 = {
        name : "小秋"
    };
    sayName.call(obj1);//小李
    sayName.call(obj2);//小秋
    ```

3. 拥有上下文对象的隐式绑定。
    ```JavaScript
    var obj = {
        name : "小秋",
        sayName : function (){
            console.log(this.name);
        }
    };
    obj.sayName();//小秋
    ```
4. 默认绑定：严格模式下绑定`undefined`，非严格模式下绑定全局变量（浏览器环境下是`window`）。
    ```JavaScript
    function sayName(){
        console.log(this.name);
    }
    var name = "小李";
    sayName();//小李
    ```

`this`的绑定也是有优先级的，它的优先级也是按照上面4条从1到4的。没错，你没有看错new绑定比显式绑定的优先级还要高，虽然这种情况并不多见，这里给出一个简单的例子，供大家参考：
```JavaScript
function Student(name){
    this.name = name;
}
var obj = {
    name:"小李"
};
var StudentWithBind = Student.bind(obj);//bind绑定
var swb = new StudentWithBind("小秋");//new绑定
console.log(swb.name);//小秋
```

上面这4条规则适用于大量的情况，但是俗话说的好“凡是都有例外”，下面2条特殊情况要格外注意。
1. 显示绑定（call、apply、bind）如果绑定的是`null`或者`undefined`，在严格模式下会绑定对应的值，在非严格模式下绑定全局变量（浏览器环境下是`window`）。
    ```JavaScript
    function sayName(){
        console.log(this.name);
    }
    var obj = {
        name : "小李",
        sayName :sayName
    }
    var name = "小秋";
    obj.sayName.call(null);//小秋
    sayName.call();//小秋
    ```
    由于绑定`null`或者`undefined`在非严格模式下会绑定全局变量`window`这样会很危险。如果这里非要绑定一个对象但是又不绑定全局变量可以绑定一个空对象就比如`{}`或者`Object.create(null)`，两者的区别是后者不会创建`Object.prototype`这个委托，也就是后者比前者更空。
2. 间接引用，本质上是默认绑定。
    ```JavaScript
    function sayName(){
        console.log(this.name);
    };
    var obj1 = {
        name : "小李",
        sayName : sayName
    }
    var obj2 = {
        name : "小秋"
    }
    var name = "小芹";
    (obj2.sayName = obj1.sayName)();//"小芹"
    ```
    JS中每一个表达式都有一个返回值，上面`obj2.sayName = obj1.sayName`也是表达式，返回值是函数`sayName`的引用。而把引用括起来是为了保证这是一个整体，后面的括号是函数的调用。也就是说这里相当于是`(sayName)()`，进一步相当于`sayName()`，很显然相当于是`window`来调用的。
3. 箭头函数，根据所处的环境（作用域）来决定。
    ```JavaScript
    var sayName = (function (){
        var name = "小明"
        //立即执行函数 这个地方的this是window
        return ()=>{
            console.log(this.name);
        };//箭头函数中的this由所处的作用域来决定 也就是window
    })();
    var name = "小华";
    var obj = {
        name:"小芳"
    };
    sayName();//小华
    sayName.call(obj);//sayName对应的箭头函数所处的作用域已指向window 即使call也不能改变指向 故打印小华
    ```

其他情况：
1. HTML事件中的this指向该DOM元素。
    ```HTML
    <button onclick="handleClick(this)">点我</button>
    <script>
        function handleClick(obj){
            obj.innerHTML = "点击了";//按钮的文案会修改为 点击了
        }
    </script>
    ```
2. JQuery获取到的DOM元素，`this`指向该DOM元素，`$(this)`是该DOM对象的JQuery封装对象。
    ```JavaScript
    $("#id").click(function() {
        console.log(this);//选中的DOM元素
        console.log($(this));//选中DOM元素的JQuery封装对象
    });
    ```