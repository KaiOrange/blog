---
title: Three.js教程（4）：相机
date: 2019-12-23 15:12:47
author: Orange
tag:
	- Three.js
categories: Three.js
---

相机这部分的内容并不是很多，Three.js主要支持两种相机，一种是`PerspectiveCamera`即`透视投影摄像机`，另一种是`OrthographicCamera`即`正交投影摄像机`。两种相机都是继承自`Camera`对象，`Camera`对象又是继承自`Object3D`。

----

## 透视投影摄像机 ##

透视投影摄像机（PerspectiveCamera）是最常用的摄像机，他跟我们的眼睛类似，**越近的物体看到的越大，越远的物体看到的越小**。
PerspectiveCamera的构造方法有4个参数，分别是**视场、长宽比、近处距离、远处距离**，其中视场表示眼睛看到的度数，比如人类可以看到前面一半左右，所以人类的视场就是180°，而火影忍者中，日向一族有一种技能叫白眼，使用该技能后其视场可以接近360°，该值默认值是50°。第二个参数长宽比一般设置为`canvas.width/canvas.height`，对于长等于屏幕的长，宽等于屏幕的宽时一般是`window.innerWidth/window.innerHeight`。最后两个近处的距离和远处的距离通常视情况而定，往往近处距离是`0.1`远处距离是`1000`。

我们先来看一个例子：

```JavaScript
var camera, scene, renderer;
var geometry, material, mesh;
var stats = new Stats();
var gui = new dat.GUI();
var obj = {
  x : 0,
  y : 2,
  z : 50,
  rotateX : 0,
  rotateY : 0,
  rotateZ : 0
};

var boxSize = 1;// 宽度是1
var rowNumber = 10;// 每行10个

function init() {
  camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 100 );

  scene = new THREE.Scene();

  for (var i = 0; i < rowNumber; i++) {
    for (var j = 0; j < rowNumber; j++) {
      geometry = new THREE.BoxGeometry( boxSize, boxSize, boxSize );
      material = new THREE.MeshNormalMaterial();
      mesh = new THREE.Mesh( geometry, material );
      scene.add( mesh );
      // 每个方块中间有一个空白间隙
      mesh.position.x = -rowNumber * boxSize + 2 * i * boxSize;
      mesh.position.z = -rowNumber * boxSize + 2 * j * boxSize;
    }
  }


  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );

  gui.add(obj, 'x', -20, 20).onChange(function (val){
    camera.position.x = val;
  });
  gui.add(obj, 'y', -20, 20).onChange(function (val){
    camera.position.y = val;
  });
  gui.add(obj, 'z', 0, 100).onChange(function (val){
    camera.position.z = val;
  });
  gui.add(obj, 'rotateX', -45, 45).onChange(function (val){
    camera.rotation.x = val / 180 * Math.PI;
  });
  gui.add(obj, 'rotateY', -45, 45).onChange(function (val){
    camera.rotation.y = val / 180 * Math.PI;
  });
  gui.add(obj, 'rotateZ', -45, 45).onChange(function (val){
    camera.rotation.z = val / 180 * Math.PI;
  });

  camera.position.z = obj.z;
  camera.position.y = obj.y;
  // 看向场景
  camera.lookAt(scene.position);

}

function animate() {
  stats.update();

  requestAnimationFrame( animate );

  renderer.render( scene, camera );
}

init();
animate();
```

效果如下：

![透视投影摄像机](1.png)

这里我们唯一没有见过的API是`camera.lookAt`它表示看向哪里，它需要接受一个`Vector3`对象作为参数，也可以是3个参数，具体如下：

```JavaScript
// 看向(0,1,0)
camera.lookAt(new THREE.Vector3( 0, 1, 0 ));

// 看向(0,1,0)
camera.lookAt(0, 1, 0);

// 看向某个位置 position是Object3D里面的一个属性表示位置 也是一个Vector3对象
camera.lookAt(scene.position);
```

## 正交投影摄像机 ##

正交投影摄像机（OrthographicCamera）看到相同大小的物体，都是一样大的。其实相当于平行光照射到一个平面上的映射。
OrthographicCamera的构造方法有6个参数，分别是`left、right、top、bottom、near、far`，即左边、右边、上边、下边、近处和远处的位置，6个值刚好确定了一个长方体，正是投射的长方体。
我们来看一个例子：

```JavaScript
var camera, scene, renderer;
var geometry, material, mesh;
var stats = new Stats();
var gui = new dat.GUI();
var obj = {
  x : 0,
  y : 3,
  z : 2,
  rotateX : 0,
  rotateY : 0,
  rotateZ : 0
};

var boxSize = 5;
var rowNumber = 10;// 每行10个

function init() {
  // camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 100 );
  // 以屏幕为宽高
  camera = new THREE.OrthographicCamera(
    window.innerWidth / -rowNumber, window.innerWidth / rowNumber,
    window.innerHeight / rowNumber, window.innerHeight / - rowNumber, -300, 300 );

  scene = new THREE.Scene();

  for (var i = 0; i < rowNumber; i++) {
    for (var j = 0; j < rowNumber; j++) {
      geometry = new THREE.BoxGeometry( boxSize, boxSize, boxSize );
      material = new THREE.MeshNormalMaterial();
      mesh = new THREE.Mesh( geometry, material );
      scene.add( mesh );
      // 每个方块中间有一个空白间隙
      mesh.position.x = -rowNumber * boxSize + 2 * i * boxSize ;
      mesh.position.z = -rowNumber * boxSize + 2 * j * boxSize;
    }
  }


  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );

  gui.add(obj, 'x', -100, 100).onChange(function (val){
    camera.position.x = val;
  });
  gui.add(obj, 'y', -100, 100).onChange(function (val){
    camera.position.y = val;
  });
  gui.add(obj, 'z', -100, 100).onChange(function (val){
    camera.position.z = val;
  });
  gui.add(obj, 'rotateX', -45, 45).onChange(function (val){
    camera.rotation.x = val / 180 * Math.PI;
  });
  gui.add(obj, 'rotateY', -45, 45).onChange(function (val){
    camera.rotation.y = val / 180 * Math.PI;
  });
  gui.add(obj, 'rotateZ', -45, 45).onChange(function (val){
    camera.rotation.z = val / 180 * Math.PI;
  });

  camera.position.z = obj.z;
  camera.position.y = obj.y;
  // 看向场景
  camera.lookAt(scene.position);
}

function animate() {
  stats.update();

  requestAnimationFrame( animate );

  renderer.render( scene, camera );
}

init();
animate();
```

运行效果如下：

![正交投影摄像机](2.png)

从上可以看到，立方体的宽高基本上都是一样的。
