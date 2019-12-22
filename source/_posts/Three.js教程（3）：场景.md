---
title: Three.js教程（3）：场景
date: 2019-12-20 15:02:13
author: Orange
tag:
	- Three.js
categories: Three.js
---

场景（Scene）相当于是一个容器，可以在它上面添加光线，物体等，最后Three.js把它和相机一起渲染到DOM中。

----

## Three.js中的坐标系 ##

在开始本章的时候我们需要先了解一下`Three.js`中的坐标系。`Three.js`的坐标系如下：

![坐标系](1.png)

由上，我们可知Three.js中的坐标系`X轴是水平朝右的，Y轴是垂直朝上的，Z轴垂直与屏幕朝向我们`，这与CSS中的坐标系的不同点在于，CSS的Y轴是垂直朝下的。下面给一个例子，可以供你更好的了解`Three.js`中的坐标系，请务必自己运行一下这个例子。

```JavaScript
var camera, scene, renderer;
var geometry, material, mesh;
var stats = new Stats();
var gui = new dat.GUI();
var obj = {
  x : 0,
  y : 0,
  z : 0,
  rotateX : 0,
  rotateY : 0,
  rotateZ : 0
};

function init() {
  camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 10 );
  camera.position.z = 5;

  scene = new THREE.Scene();
  geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
  material = new THREE.MeshLambertMaterial();
  mesh = new THREE.Mesh( geometry, material );
  mesh.receiveShadow = true;
  scene.add( mesh );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );

  gui.add(obj, 'x', -3, 3);
  gui.add(obj, 'y', -3, 3);
  gui.add(obj, 'z', -3, 3);
  gui.add(obj, 'rotateX', 0, 360);
  gui.add(obj, 'rotateY', 0, 360);
  gui.add(obj, 'rotateZ', 0, 360);
}

function animate() {
  stats.update();

  requestAnimationFrame( animate );
  mesh.position.x = obj.x;
  mesh.position.y = obj.y;
  mesh.position.z = obj.z;
  // 需要把角度修改为弧度
  mesh.rotation.x = obj.rotateX / 180 * Math.PI;
  mesh.rotation.y = obj.rotateY / 180 * Math.PI;
  mesh.rotation.z = obj.rotateZ / 180 * Math.PI;
  renderer.render( scene, camera );
}

init();
animate();
```

效果图如下，你可以自己调一下参数：

![效果图](2.png)

## 场景的属性和方法 ##

创建场景很简单：

```JavaScript
var scene = new THREE.Scene();
```

对于他的属性和方法也不是很多：

类型|名称|描述|默认值
---|---|---|---
属性|fog|场景中雾的效果|null
属性|overrideMaterial|覆盖材质，如果有这个那么场景中物体的材质会被覆盖|null
属性|autoUpdate|自动更新|true
属性|background|背景|null
方法|toJSON()|把场景转换为JSON对象，可以供Three.js导入场景使用|-
方法|dispose()|清楚缓存数据|-

`THREE.Scene`的属性并不多，你可能会问，之前把`Mesh`添加到`Scene`中使用到了一个`add`方法怎么没写？确实场景是有这个方法的，更准确的说这个方法是来自它的父类[THREE.Object3D](https://threejs.org/docs/index.html#api/en/core/Object3D)的，它是好多Three.js对象的直接或间接父类，所以了解它的属性和方法非常有必要，由于篇幅有限，这里就不再叙述了，你可以在[这里](https://threejs.org/docs/index.html#api/en/core/Object3D)看一看。

## 背景设置 ##

根据上面的API设置背景的话就非常简单了：

```JavaScript
scene.background = new THREE.Color('orange');
```

效果如下：
![效果图](3.png)

注意这里必须是Color对象（而不是字符串的值，或者16进制的数字）。这里我们遇到了一个新的对象叫`Color`，该对象的参数表示什么颜色，主要有这么几种格式：

```JavaScript
// 颜色的关键字
var color = new THREE.Color('orange');

// 默认背景，白色的 注意Three.js渲染的默认背景是黑色的
var color = new THREE.Color();

// 十六进制数字
var color = new THREE.Color( 0xff0000 );

// RGB字符串
var color = new THREE.Color("rgb(255, 0, 0)");
var color = new THREE.Color("rgb(100%, 0%, 0%)");

// HSL字符串
var color = new THREE.Color("hsl(0, 100%, 50%)");

// RGB的值 取值范围0~1 如红色：
var color = new THREE.Color( 1, 0, 0 );
```

除了直接使用`scene.background`外还有另外一种设置背景颜色的方法是，就是设置清屏的颜色：

```JavaScript
renderer.setClearColor(new THREE.Color(0xff0000));
```

两者之前`scene.background`的优先级会更高一些，因为scane相当于是在清屏的背景之上再绘制了一层。

## 雾化效果 ##

我们现在使用的是`MeshNormalMaterial`这个材质，要使用雾化效果和光线效果，那么需要`MeshLambertMaterial`或者`MeshPhongMaterial`这两种材质，具体的细节我们后面讨论。现在我们先把材质换成`MeshLambertMaterial`，然后做下面修改看看雾化效果：

```JavaScript
scene.fog = new THREE.Fog(0xffffff, 0.1, 10);
```

具体的效果需要手动修改z轴看来不同浓雾下物块的样子，效果如下：

![近处效果图](4.png)
![远处效果图](5.png)

这里需要注意一下我们的物块是黑色的即使修改材质`MeshLambertMaterial`的颜色也是黑色的，因为目前还没有添加光线。

上面我们使用了`Fog`对象，他的构造函数有3个参数，分别是**颜色、雾的起始距离，雾的结束距离**。`Fog`对象出来的雾是线性增长的，Three.js还提供了一种指数增长的雾是`FogExp2`，它有两个参数分别是颜色和浓度，可以如下设置：

```JavaScript
scene.fog = new THREE.FogExp2(0xffffff, 0.01);
```

## 设置统一的材质 ##

设置场景中所有物体的材质，其实是很简单的，如：

```JavaScript
scene.overrideMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
```

由于我们目前还没有加入光线，所以现在看不了效果，这个例子先不做演示，只要记得有个方法可以设置就行了，到时候自己查一下基本上OK。
