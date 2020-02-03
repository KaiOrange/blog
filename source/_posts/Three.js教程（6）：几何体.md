---
title: Three.js教程（6）：几何体
date: 2020-02-01 09:18:14
author: Orange
tag:
	- Three.js
categories: Three.js
---

之前的章节中我们使用了平地、方块、球体等几何体（Geometry），今天我们探讨更多的[几何体](https://threejs.org/docs/index.html#api/en/core/Geometry)。
先说一个事实，在WebGL中只能绘制3种东西，分别是**点、线和三角形**。什么？我们之前做的方块和球体，明明就不是三角形呢？其实他们确实是由三角形组成的。多个小的三角形就是可以组成包括球体以内的几乎任何几何体。我们先从简单的例子开始今天的课程吧。

----

## PlaneGeometry ##

[PlaneGeometry](https://threejs.org/docs/index.html#api/en/geometries/PlaneGeometry)就是一个平地，我们直接看例子吧：

```JavaScript
var geometry = new THREE.PlaneGeometry(30, 30, 10, 10);
var material = new THREE.MeshBasicMaterial({ color:'#ff0000'});
material.wireframe = true;
mesh = new THREE.Mesh(geometry, material);
// 由于平地添加后默认是在正前方 所以需要旋转一下
mesh.rotation.x = -0.5 * Math.PI;
mesh.position.y = -10;
scene.add(mesh);
```

`PlaneGeometry`的构造函数有四个参数，分别是长、宽、长的段数和宽的段数；这里长分成了10段，宽也分成了10段。另外我们这里使用了材质`MeshBasicMaterial`，其中`wireframe`为`false`表示只显示空的框架。`MeshBasicMaterial`的更多细节将在下章讨论。此时的效果如下，我们可以很清楚的看到平地是由三角形构成的。

![PlaneGeometry_1](1.jpeg)

由于平地添加后默认和电脑屏幕是一个平面，我们这里需要在下方，所以需要走旋转：`mesh.rotation.x = -0.5 * Math.PI;`。

我们上面的代码添加了一块平地，但是不利于调试，现在我们调整代码，使用`gui`来管理：

```JavaScript
var step = 0;

function createMesh(geometry) {
  var material = new THREE.MeshBasicMaterial({
    color:'#ff0000'
  });
  material.wireframe = true;
  var mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

var obj = {
  width: 30,
  height: 30,
  widthSegments: 10,
  heightSegments: 10,
  getGeometry (){
    return new THREE.PlaneGeometry(this.width, this.height, this.widthSegments, this.heightSegments);
  },
  update () {
    if (mesh) {
      // 先删除
      scene.remove(mesh);
      // 后创建一个新的
      mesh = createMesh(this.getGeometry());
      // 再添加到场景中
      scene.add(mesh);
    }
  },
};

// 添加一片平地
mesh = createMesh(obj.getGeometry());
scene.add(mesh);

gui.add(obj, 'width', 0, 40).onChange(function () {
  obj.update();
});
gui.add(obj, 'height', 0, 40).onChange(function () {
  obj.update();
});
gui.add(obj, 'widthSegments', 0, 20).onChange(function () {
  obj.update();
});
gui.add(obj, 'heightSegments', 0, 20).onChange(function () {
  obj.update();
});

function animate() {
  stats.update();

  // 添加了一行控制旋转的代码
  mesh.rotation.y = step += 0.01;

  requestAnimationFrame( animate );

  renderer.render( scene, camera );
}

```

上述`createMesh`用来创建一个mesh；`obj`对象是gui的控制器对象，其中`getGeometry`方法是用来获取`Geometry`对象，`update`函数用来更新几何体；最后在`animate`添加代码，用来控制mesh旋转。此时的效果如下，你可以修改参数来更新mesh：

![PlaneGeometry_2](2.jpeg)

## CircleGeometry ##

[CircleGeometry](https://threejs.org/docs/index.html#api/en/geometries/CircleGeometry)是一种圆形的平面几何体。`CircleGeometry`构造方法的参数有四个，分别是`radius`，表示圆形的半径；`segments`，表示分为几段，默认是8段；`thetaStart`表示起始的弧度，默认是0；`thetaLength`表示总共的弧度，默认是`2 * Math.PI`也就是一个圆，我们先来看个例子，这个例子就是在上一个例子中修改`obj`对象。

```JavaScript
 var obj = {
  radius: 10,
  segments: 8,
  thetaStart: 0,
  thetaLength: 2 * Math.PI * 3 / 4,
  getGeometry (){
    return new THREE.CircleGeometry(this.radius, this.segments, this.thetaStart, this.thetaLength);
  },
  update () {
    if (mesh) {
      // 先删除
      scene.remove(mesh);
      // 后创建一个新的
      mesh = createMesh(this.getGeometry());
      // 再添加到场景中
      scene.add(mesh);
    }
  },
};
```

这里我们画了一个3/4圆，你可以设置`segments`，你会发现当小于3的时候也会按照3个来绘制的，如果是小数，`Three.js`也会转化为整数（向下取整）来处理，**但是最好还是传入的就是整数，因为有的几何体传入小数的段数会报错**。效果如下：

![CircleGeometry](3.jpeg)

## RingGeometry ##

[RingGeometry](https://threejs.org/docs/index.html#api/en/geometries/RingGeometry)是一种环状的平面几何体。`RingGeometry`的构造方法有6个参数，分别是`innerRadius`，表示内圆半径；`outerRadius`，表示外圆半径；`thetaSegments`，表示分成几个三角形，默认是8个，最小3个，与上面是一样的；`phiSegments`表示半径方向分为多少个三角形，最小是1个，默认也是8个；后两个是`thetaStart`和`thetaLength`、跟上面是一样的。我们再修改一下`obj`对象，如下：

```JavaScript
var obj = {
  innerRadius: 5,
  outerRadius: 10,
  thetaSegments: 8,
  phiSegments: 8,
  thetaStart: 0,
  thetaLength: 2 * Math.PI * 3 / 4,
  getGeometry (){
    return new THREE.RingGeometry(
        this.innerRadius,
        this.outerRadius,
        Math.round(this.thetaSegments),
        Math.round(this.phiSegments),
        this.thetaStart,
        this.thetaLength
      );
  },
  update () {
    if (mesh) {
      // 先删除
      scene.remove(mesh);
      // 后创建一个新的
      mesh = createMesh(this.getGeometry());
      // 再添加到场景中
      scene.add(mesh);
    }
  },
};
```

![RingGeometry](4.jpeg)

## BoxGeometry ##

上面我们说的都是平面几何体，现在看看三维几何体，首先来看的是[BoxGeometry](https://threejs.org/docs/index.html#api/en/geometries/BoxGeometry)，这个几何体我们前面见得挺多的，就是一个长方体。他的构造方法有6个参数，分别是长宽高，和长宽高的段数，默认值都是1。示例代码如下：

```JavaScript
var obj = {
  width: 10,
  height: 10,
  depth: 10,
  widthSegments: 1,
  heightSegments: 1,
  depthSegments: 1,
  getGeometry (){
    return new THREE.BoxGeometry(
        this.width,
        this.height,
        this.depth,
        Math.round(this.widthSegments),
        Math.round(this.heightSegments),
        Math.round(this.depthSegments),
      );
  },
  update () {
    if (mesh) {
      // 先删除
      scene.remove(mesh);
      // 后创建一个新的
      mesh = createMesh(this.getGeometry());
      // 再添加到场景中
      scene.add(mesh);
    }
  },
};
```

运行结果如下：

![BoxGeometry](5.jpeg)

## SphereGeometry ##

[SphereGeometry](https://threejs.org/docs/index.html#api/en/geometries/SphereGeometry)是一个球体几何体。构造方法参数分别是：`radius`表示半径；`widthSegments`表示水平方向段数；`heightSegments`表示垂直方向的段数；`phiStart`表示水平方向的起始弧度，默认`0`；`phiLength`表示水平方向的总弧度，默认`Math.PI * 2`；`thetaStart`表示垂直方向的起始弧度，默认`0`；`thetaLength`表示垂直方向的总弧度，默认`Math.PI`。示例代码如下：

```JavaScript
var obj = {
  radius: 10,
  widthSegments:8,
  heightSegments: 8,
  phiStart: 0,
  phiLength: 2 * Math.PI,
  thetaStart: 0,
  thetaLength: Math.PI,
  getGeometry (){
    return new THREE.SphereGeometry(
        this.radius,
        Math.round(this.widthSegments),
        Math.round(this.heightSegments),
        this.phiStart,
        this.phiLength,
        this.thetaStart,
        this.thetaLength,
      );
  },
  update () {
    if (mesh) {
      // 先删除
      scene.remove(mesh);
      // 后创建一个新的
      mesh = createMesh(this.getGeometry());
      // 再添加到场景中
      scene.add(mesh);
    }
  },
};
```

运行结果如下：

![SphereGeometry](6.jpeg)

## 更多几何体 ##

我们上面讲了5种几何体，估计你也知道了创建几何体的套路了，其他几何体的创建方式和上面的基本一致，这里就不做更多的叙述了。`Three.js`还提供的几何体有：[ConeGeometry](https://threejs.org/docs/index.html#api/en/geometries/ConeGeometry)、[CylinderGeometry](https://threejs.org/docs/index.html#api/en/geometries/CylinderGeometry)、[DodecahedronGeometry](https://threejs.org/docs/index.html#api/en/geometries/DodecahedronGeometry)、[ExtrudeGeometry](https://threejs.org/docs/index.html#api/en/geometries/ExtrudeGeometry)、[IcosahedronGeometry](https://threejs.org/docs/index.html#api/en/geometries/IcosahedronGeometry)、[LatheGeometry](https://threejs.org/docs/index.html#api/en/geometries/LatheGeometry)、[OctahedronGeometry](https://threejs.org/docs/index.html#api/en/geometries/OctahedronGeometry)、[ParametricGeometry](https://threejs.org/docs/index.html#api/en/geometries/ParametricGeometry)、[PolyhedronGeometry](https://threejs.org/docs/index.html#api/en/geometries/PolyhedronGeometry)、[ShapeGeometry](https://threejs.org/docs/index.html#api/en/geometries/ShapeGeometry)、[TextGeometry](https://threejs.org/docs/index.html#api/en/geometries/TextGeometry)、[TetrahedronGeometry](https://threejs.org/docs/index.html#api/en/geometries/TetrahedronGeometry)、[TorusGeometry](https://threejs.org/docs/index.html#api/en/geometries/TorusGeometry)、[TorusKnotGeometry](https://threejs.org/docs/index.html#api/en/geometries/TorusKnotGeometry)、[TubeGeometry](https://threejs.org/docs/index.html#api/en/geometries/TubeGeometry)等。由于篇幅有限就不一一展开说了。当然`Three.js`不仅仅可以使用给出的几何体，甚至还可以自定义几何体，最重要的是还可以导入其他建模软件做出来的模型，这一点是非常厉害的。
