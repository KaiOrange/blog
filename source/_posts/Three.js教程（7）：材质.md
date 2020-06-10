---
title: Three.js教程（7）：材质
date: 2020-05-27 12:00:00
author: Orange
tag:
	- Three.js
categories: Three.js
---

之前说过`网格（Mesh） = 几何体（Geometry） + 材质（Material）`，也就是一个物体是有它的形状和材质来决定。几何体（Geometry）类似于前端的HTML而材质（Material）类似于前端的CSS，今天我们看一下材质相关的内容。

----

## Material ##

[Material](https://threejs.org/docs/index.html#api/en/materials/Material)是所有材质的父类，它内部定义了好多通用的属性和方法，你可以看看它的API，这里就不再重复了，现在我们看看他的子类。

## MeshBasicMaterial ##

听名字就知道[MeshBasicMaterial](https://threejs.org/docs/index.html#api/en/materials/MeshBasicMaterial)是最基本的材质，我们之前见过他好几次了，现在再来重温一下它的代码：

```JavaScript
 // 添加一个正方体
var geometry = new THREE.BoxGeometry(10, 10, 10,3, 3, 3);
var material = new THREE.MeshBasicMaterial({
  color: '#ff0000',
  wireframe: true,
  opacity: 1
  transparent: true
});
mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

`MeshBasicMaterial`只有一个参数，即配置项，我们这里设置了4个参数。这里需要注意的是，要使`opacity`生效那么`transparent`的值一定要设置成`true`，此时的效果如下：

![MeshBasicMaterial](1.png)

## MeshDepthMaterial ##

[MeshDepthMaterial](https://threejs.org/docs/index.html#api/en/materials/MeshDepthMaterial)是一种可以根据距离摄像机的远近而展示不同效果的材质。跟`MeshBasicMaterial`一样也是有一个参数，即设置项，但是这个材质不能设置颜色。例子中给出的代码跟上面的几乎一模一样。这里需要注意的地方是`MeshDepthMaterial`材质跟摄像机的远近有着非常重要的联系，所以你需要设置摄像机的`near`和`far`来表示到底有多近以及有多远。

```JavaScript
// 第三个参数是near 第四个参数是far
var camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 24, 100 );
var scene = new THREE.Scene();

var geometry = new THREE.BoxGeometry(10, 10, 10,3, 3, 3);
var material = new THREE.MeshDepthMaterial();
mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

这一部分最好自己运行一下代码，在代码中可以修改near和far以更直观的体会`MeshDepthMaterial`的用法。

![MeshDepthMaterial](2.png)

## 联合材质 ##

上面的`MeshDepthMaterial`材质是一种由摄像机距离来确定的样式的材质，它不能设置颜色，但是大多数的时候我们需要设置一个颜色，那怎么做呢？由上面我们知道`MeshBasicMaterial`是可以设置颜色的，只要把两种材质联合起来就可以了，这里说的联合材质并不是一种材质，而是把多个材质混合起来的一种办法，要使用联合材质首先需要引入`SceneUtils.js`文件，该文件必须在`three.js`的下方引入，如下：

```HTML
<script type="text/javascript" src="../node_modules/three/examples/js/utils/SceneUtils.js"></script>
```

引入上面的JS文件后，会多出一个`THREE.SceneUtils`的类，该类的对象有一个`createMultiMaterialObject`方法，可以创建多种混合材质的网格（Mesh），具体代码如下：

```JavaScript
var geometry = new THREE.BoxGeometry(10, 10, 10,3, 3, 3);
var depthMaterial = new THREE.MeshDepthMaterial();
var colorMaterial = new THREE.MeshBasicMaterial({
    color: '#ff0000',
    transparent: true,
    blending: THREE.MultiplyBlending
});
mesh = new THREE.SceneUtils.createMultiMaterialObject(geometry, [depthMaterial, colorMaterial]);
scene.add(mesh);
```

注意这里的Mesh不再是通过`new THREE.Mesh(geometry, material);`这样来创建的。此时效果如下：

![联合材质](3.png)

## MeshNormalMaterial ##

[MeshNormalMaterial](https://threejs.org/docs/index.html#api/en/materials/MeshNormalMaterial)是一种五彩缤纷的材质，它的每一个面的颜色由法向量来决定，用法和`MeshBasicMaterial`一模一样。示例代码如下：

```JavaScript
var geometry = new THREE.BoxGeometry(10, 10, 10,3, 3, 3);
var material = new THREE.MeshNormalMaterial({
  color: '#ff0000',
});
mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

上面虽然设置了颜色，但是可以看到它的颜色并不是由color属性来决定的，运行结果如下：

![MeshNormalMaterial](4.png)

## 不同面使用不同的材质 ##

不同面使用不同的材质很简单，只要把材质传一个数组就可以了，与联合材质不同的是，联合材质是多种材质混合使用，这里是每一个面用了一种材质。在老版本的three.js中有一个名叫`MeshFaceMaterial`的材质可以让不同面拥有不同的材质，这里就不简绍已经废弃的`MeshFaceMaterial`了。示例代码如下：

```JavaScript
var geometry = new THREE.BoxGeometry(10, 10, 10, 3, 3, 3);
var mats = [];
mats.push(new THREE.MeshBasicMaterial({color: 0xff0000}));
mats.push(new THREE.MeshBasicMaterial({color: 0x00ff00}));
mats.push(new THREE.MeshBasicMaterial({color: 0x0000ff}));
mats.push(new THREE.MeshBasicMaterial({color: 'orange'}));
mats.push(new THREE.MeshBasicMaterial({color: 'yellow'}));
mats.push(new THREE.MeshBasicMaterial({color: 'grey'}));

mesh = new THREE.Mesh(geometry, mats);
scene.add(mesh);
```

运行结果如下：

![不同面使用不同的材质](5.png)

## MeshLambertMaterial ##

[MeshLambertMaterial](https://threejs.org/docs/index.html#api/en/materials/MeshLambertMaterial)是一种感光的材质。我们之前在光源那一张已经展示过，就直接把之前的例子拿过来了。

```JavaScript
// 添加正方体
var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// 正方体位置
cube.position.x = -6;
cube.position.y = -6;
cube.position.z = 0;
cube.castShadow = true;
// 把正方体添加到场景中
scene.add(cube);

// 添加小球
var sphereGeometry = new THREE.SphereGeometry(2, 20, 20);
var sphereMaterial = new THREE.MeshLambertMaterial({color: 0x00ff00});
var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
// 小球位置
sphere.position.x = 6;
sphere.position.y = -6;
sphere.position.z = 0;
sphere.castShadow = true;
// 把小球添加到场景中
scene.add(sphere);

// 添加一片平地
var planeGeometry = new THREE.PlaneGeometry(30, 30, 100, 100);
var planeMaterial = new THREE.MeshLambertMaterial({color: 0xdddddd});
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
// 由于平地添加后默认是在正前方 所以需要旋转一下
plane.rotation.x = -0.5 * Math.PI;
plane.position.y = -10;
plane.receiveShadow = true;
scene.add(plane);
```

运行结果如下：

![MeshLambertMaterial](6.png)

## MeshPhongMaterial ##

[MeshPhongMaterial](https://threejs.org/docs/index.html#api/en/materials/MeshPhongMaterial)也是一种感光材质，使用方法和`MeshLambertMaterial`完全一样。其效果也差不多，唯一的区别是`MeshPhongMaterial`材质的效果会更加亮一些，它带的反光感会更加明显，主要用于玻璃等明亮的物体。同样的，我们只要把上面例子中的`MeshLambertMaterial`材质改成`MeshPhongMaterial`看一下效果：

```JavaScript
// 添加正方体
var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
var cubeMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// 正方体位置
cube.position.x = -6;
cube.position.y = -6;
cube.position.z = 0;
cube.castShadow = true;
// 把正方体添加到场景中
scene.add(cube);

// 添加小球
var sphereGeometry = new THREE.SphereGeometry(2, 20, 20);
var sphereMaterial = new THREE.MeshPhongMaterial({color: 0x00ff00});
var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
// 小球位置
sphere.position.x = 6;
sphere.position.y = -6;
sphere.position.z = 0;
sphere.castShadow = true;
// 把小球添加到场景中
scene.add(sphere);

// 添加一片平地
var planeGeometry = new THREE.PlaneGeometry(30, 30, 100, 100);
var planeMaterial = new THREE.MeshPhongMaterial({color: 0xdddddd});
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
// 由于平地添加后默认是在正前方 所以需要旋转一下
plane.rotation.x = -0.5 * Math.PI;
plane.position.y = -10;
plane.receiveShadow = true;
scene.add(plane);
```

你会看到小球会更亮一些，运行结果如下：

![MeshPhongMaterial](7.png)

## 线段相关的材质 ##

[LineBasicMaterial](https://threejs.org/docs/index.html#api/en/materials/LineBasicMaterial)和[LineDashedMaterial](https://threejs.org/docs/index.html#api/en/materials/LineDashedMaterial)都是线段特有的材质，其中前者是后者的父类。两者的区别是后者是虚线前者是实线。所以`LineDashedMaterial`拥有`dashSize`（虚线中，线段部分长度，默认值是3）、`gapSize`（虚线中，线段与线段的间距，默认值是1）和`scale`（缩放大小，默认值是1，可以在不改变虚线总长的时候来设置虚线中线段与间距的大小）三个用来控制虚线的属性。先来看一个`LineBasicMaterial`的例子：

```JavaScript
var geometry = new THREE.Geometry();
geometry.vertices.push(new THREE.Vector3(0, 0, 0));
for (let i = 1; i < 10; i++) {
  geometry.vertices.push(new THREE.Vector3(i, i - 1, 0));
  geometry.vertices.push(new THREE.Vector3(i, -i , 0));
  geometry.vertices.push(new THREE.Vector3(-i, -i, 0));
  geometry.vertices.push(new THREE.Vector3(-i, i, 0));
}
var material = new THREE.LineBasicMaterial({
  color: '#ffffff',
});
var line = new THREE.Line(geometry, material);
scene.add(line);
```

效果如下：

![LineBasicMaterial](8.png)

我们稍加改动，改成`LineDashedMaterial`的例子：

```JavaScript
var geometry = new THREE.Geometry();
geometry.vertices.push(new THREE.Vector3(0, 0, 0));
for (let i = 1; i < 10; i++) {
  geometry.vertices.push(new THREE.Vector3(i, i - 1, 0));
  geometry.vertices.push(new THREE.Vector3(i, -i , 0));
  geometry.vertices.push(new THREE.Vector3(-i, -i, 0));
  geometry.vertices.push(new THREE.Vector3(-i, i, 0));
}
var material = new THREE.LineDashedMaterial({
  color: '#ffffff',
  scale: 1,
  dashSize: 3,
  gapSize: 1,
});
var line = new THREE.Line(geometry, material);
line.computeLineDistances();
scene.add(line);
```

需要注意的是**要使虚线生效必须调用一下line.computeLineDistances()**，此时效果如下：

![LineDashedMaterial](9.png)

----

至此，`three.js`的基本概念我们已经讲完了，大家是不是收获满满？`three.js`看似东西多，其实基本套路都是一样的，就比如基本上所有的设置材质的方法都是类似的。
