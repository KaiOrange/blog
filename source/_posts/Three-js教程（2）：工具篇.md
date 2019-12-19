---
title: Three.js教程（2）：工具篇
date: 2019-12-19 15:34:59
author: Orange
tag:
	- Three.js
categories: Three.js
---

上一章我们基本上领略了`three.js`的魅力，这一章我们先不急着深入`three.js`，先学习2个非常有用的工具库，分别是`stats.js`和`dat.gui`，也许你没有听过两个库，但是很可能你见过他们。

----

## stats.js ##

[stats.js](https://github.com/mrdoob/stats.js)是`three.js`的作者`mrdoob`开发的一个简单的JavaScript性能监控的库。使用方法很简单：

```JavaScript
var stats = new Stats();
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

function animate() {
  stats.begin();

  // monitored code goes here

  stats.end();
  requestAnimationFrame( animate );\
}

requestAnimationFrame( animate );
```

它有3种模式，从上面的注释中也可以看的出来：

> 0：**FPS**，最近1秒的帧率，值越大表示性能越好；
> 1：**MS**，每一帧需要多少毫秒，值越小表示性能越好；
> 2：**MB**，所分配的内存，谷歌浏览器启动的时候需要添加参数`--enable-precise-memory-info`；
> 3或者以上：用户自定义（通常用不到这个）。

通常我们关注最多的是`0`这种模式，一般60Hz CPU的浏览器，一秒最多可以绘制60次，也就是FPS接近60，如果远远低于这个值，说明代码效率不高或者代码有问题。上述`stats`对象还有一个方法`stats.update();`，如果我们只关注每2次绘制间代码的FPS，那么用这个方法更方便，[stats.js的源代码点击这里查看](https://github.com/mrdoob/stats.js/blob/master/src/Stats.js)。

最后我们把上一章的最后一个例子使用`stats.js`框架来处理：

```diff
+ <script type="text/javascript" src="../node_modules/stats.js/build/stats.min.js"></script>
  <script type="text/javascript">
    var camera, scene, renderer;
    var geometry, material, mesh;
+    var stats = new Stats();

    function init() {
      // 此处代码和上章的相同就不再重复

+      stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
+      document.body.appendChild( stats.dom );
    }

    function animate() {
+      stats.update();

      // 此处代码和上章的相同就不再重复
    }

    init();
    animate();
  </script>
```

效果如下，可以看到我们的代码基本上都是60FPS，说明我们的代码性能还不错。

![stats.js的使用](1.png)

## dat.gui ##

[dat.gui](https://github.com/dataarts/dat.gui)是一个轻量级的JavaScript控制库，它可以很方便控制变量的值。首先需要引入`dat.gui.css`，然后需要引入`dat.gui.min.js`，我们来一个猛一点的[例子](https://github.com/KaiOrange/three.js-demo/blob/master/02/03_%E5%BC%95%E5%85%A5dat.gui.html)：

```HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
  <link rel="stylesheet" href="../node_modules/dat.gui/build/dat.gui.css"></link>
  <style>
    *{
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  我叫<span id="nameSpan"></span>
  <script type="text/javascript" src="../node_modules/dat.gui/build/dat.gui.min.js"></script>
  <script type="text/javascript">
    var gui = new dat.GUI({
      name: '测试GUI',
      useLocalStorage: false, // 使用LocalStorage来存储
      closeOnTop: false// 关闭按钮是否在顶部
    });

    var obj = {
      name: 'Orange',
      age: 18,
      money: 100,
      isStudent: true,
      hobby1:'篮球',
      hobby2:'Run',
      color1: '#FF0000', // CSS string
      color2: [ 0, 128, 255 ], // RGB array
      color3: [ 0, 128, 255, 0.3 ], // RGB with alpha
      color4: { h: 350, s: 0.9, v: 0.3 }, // Hue, saturation, value
      num: 0,
      // 请允许我这里写汉字
      打印: function (){
        this.num++;// 非GUI改变变量 需要listen
        console.log(this)
      }
    };

    var folder1 = gui.addFolder('基本信息');
    folder1.open(); // 打开第一个文件夹
    // 首先赋值一次
    var $nameSpan = document.getElementById('nameSpan');
    $nameSpan.innerText = obj.name;
    // 监听到name的变化 则写入DOM
    folder1.add(obj, 'name').onChange(function (val){
      $nameSpan.innerText = val;
    })
    folder1.add(obj, 'age', 0, 100,1);// 0~100每次增加或者减少1
    folder1.add(obj, 'money',0,1000);// 0~1000
    folder1.add(obj, 'isStudent');// 如果值是boolean类型的那么就会当做复选框
    folder1.add(obj, 'hobby1',['篮球','游泳','跑步']);// 如果第三个值是数组或者对象那么会渲染成选项框
    // 如果第三个值是数组或者对象那么会渲染成选项框
    folder1.add(obj, 'hobby2',{'篮球':'Basketball','游泳':'Swimming','跑步':'Run'});

    var folder2 = gui.addFolder('颜色');
    folder2.addColor(obj, 'color1');
    folder2.addColor(obj, 'color2');
    folder2.addColor(obj, 'color3');
    folder2.addColor(obj, 'color4');

    // 添加到gui上
    gui.add(obj, '打印');// 如果是函数的话 那么就会当做按钮
    // 注意这里的num是在 打印 函数中改变的 而不是手动修改GUI的 这种非GUI改变的时候需要监听 那么需要调用.listen()方法
    gui.add(obj, 'num').listen();

    document.body.appendChild(gui.domElement);
  </script>
</body>
</html>
```

大致效果如下：

![测试dat.gui](2.png)

是不是有点似曾相识？其实网上好多`canvas`和`three.js`的特效都会引入这个库来简单的控制变量，这个库最6的地方是当GUI上的值改变的时候，内存中的数据也变了，你可以点击打印按钮来打印对象obj的值。

## dat.gui的使用 ##

现在我们们在我们上个例子中引入dat.gui：

```diff
  <!-- 上面部分跟之前相同 -->
+  <link rel="stylesheet" href="../node_modules/dat.gui/build/dat.gui.css"></link>
  <style>
    *{
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <script type="text/javascript" src="../node_modules/three/build/three.js"></script>
  <script type="text/javascript" src="../node_modules/stats.js/build/stats.min.js"></script>
+  <script type="text/javascript" src="../node_modules/dat.gui/build/dat.gui.min.js"></script>
  <script type="text/javascript">
    var camera, scene, renderer;
    var geometry, material, mesh;
    var stats = new Stats();
+    var gui = new dat.GUI();
+    var obj = {
+      speedX : 0.01,
+      speedY : 0.02
+    };

    function init() {
      // 此处代码和上章的相同就不再重复

+      gui.add(obj, 'speedX', 0, 0.1);
+      gui.add(obj, 'speedY', 0, 0.1);
    }

    function animate() {
      stats.update();

      requestAnimationFrame( animate );
+      mesh.rotation.x += obj.speedX;
+      mesh.rotation.y += obj.speedY;
      renderer.render( scene, camera );
    }

    init();
    animate();
  </script>
</body>
</html>
```

出来的效果如图所示，你可以修改GUI的值来改变小方块的转速。

![dat.gui的使用](3.png)
