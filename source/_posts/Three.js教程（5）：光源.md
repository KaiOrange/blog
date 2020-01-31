---
title: Three.js教程（5）：光源
date: 2020-01-30 13:09:37
author: Orange
tag:
	- Three.js
categories: Three.js
---

`Three.js`的作用就是做3D效果，一说到3D就绕不过一个话题，那就是阴影。而要出现阴影的效果，那么就要涉及光源。本章介绍`Three.js`中光源相关的知识。

----

## 光源简介 ##

光源是[THREE.Light](https://threejs.org/docs/index.html#api/en/lights/Light)类的子类。所有光源都有2个属性，一个是`color`，是一个`THREE.Color`类型的值，表示光源的颜色；另一个是`intensity`，一个浮点型的值，表示光照强度。本章所有的光源都有这2个值，你可以在本章配套代码中随意修改这2个值。
这章我们围绕一个例子来展开，基本的代码如下：

```JavaScript
// 添加正方体
var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
var cubeMaterial = new THREE.MeshNormalMaterial();
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// 正方体位置
cube.position.x = -6;
cube.position.y = -6;
cube.position.z = 0;
// 把正方体添加到场景中
scene.add(cube);

  // 添加小球
var sphereGeometry = new THREE.SphereGeometry(2, 20, 20);
var sphereMaterial = new THREE.MeshNormalMaterial();
var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
// 小球位置
sphere.position.x = 6;
sphere.position.y = -6;
sphere.position.z = 0;
// 把小球添加到场景中
scene.add(sphere);

// 添加一片平地
var planeGeometry = new THREE.PlaneGeometry(30, 30, 100, 100);
var planeMaterial = new THREE.MeshNormalMaterial();
// var planeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
// 由于平地添加后默认是在正前方 所以需要旋转一下
plane.rotation.x = -0.5 * Math.PI;
plane.position.y = -10;
scene.add(plane);
```

上面添加了一个正方形（BoxGeometry），一个球形（SphereGeometry），一个平地（PlaneGeometry）。这三个`Geometry`你可能不熟悉，我们会在下个章节来专门讲，现在不熟悉无所谓，此时的效果如下：

![基本场景](1.png)

## SpotLight ##

[SpotLight](https://threejs.org/docs/#api/en/lights/SpotLight)是一种圆锥形的光源（聚光灯光源），类似于手电筒或者路灯这样的光源，**SpotLight具有方向，并且可以产生阴影**。现在我们给上面的场景中添加阴影。要想让场景中有一下4个步骤：

1.添加光源并设置可以传播阴影：

  ```JavaScript
  // 添加光源
  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(0, 10, 0);
  spotLight.castShadow = true;
  scene.add(spotLight);
  ```

  `Three.js`出于性能考虑，默认`castShadow`是`false`，也就是默认不会产生阴影的。

2.使用可以感光的材质。
  我们上述使用的材质`MeshNormalMaterial`是不会对光源有反应的材质，我们需要一种对光源产出反应的材质，常用的感光材质有：[MeshLambertMaterial](https://threejs.org/docs/index.html#api/en/materials/MeshLambertMaterial)和[MeshPhongMaterial](https://threejs.org/docs/index.html#api/en/materials/MeshPhongMaterial)。我们这里就使用`MeshLambertMaterial`材质来替换上面的`MeshNormalMaterial`吧，材质相关的知识将会在下下章节中讲。

  ```diff
  // ... 其他代码
  - var cubeMaterial = new THREE.MeshNormalMaterial();
  + var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
  // ... 其他代码
  - var sphereMaterial = new THREE.MeshNormalMaterial();
  + var sphereMaterial = new THREE.MeshLambertMaterial({color: 0x00ff00});
  // ... 其他代码
  - var planeMaterial = new THREE.MeshNormalMaterial();
  + var planeMaterial = new THREE.MeshLambertMaterial({color: 0xdddddd});
  // ... 其他代码
  ```

  这里需要注意的是，如果把材质换成感光材质而没有引入光源，是看不到物体的，跟我们在黑暗中看东西是一样的。

3.设置物体传播（产生）阴影或接收阴影：

  ```JavaScript
  cube.castShadow = true;
  // ... 其他代码
  sphere.castShadow = true;
  // ... 其他代码
  plane.receiveShadow = true;
  ```

4.渲染器开启阴影映射：

  ```JavaScript
  renderer.shadowMapEnabled = true;
  ```

此时的效果如下：

![SpotLight](2.png)

## PointLight ##

[PointLight](https://threejs.org/docs/index.html#api/en/lights/PointLight)是点光源，听名字就知道了，它是一个点向四面八方发射光线的光源，**点光源不能产生阴影**。

我们在上一个例子中的添加一个点光源：

 ```JavaScript
var pointLight = new THREE.PointLight("#ffd200");
scene.add(pointLight);
```

修改聚光灯光源的角度，运行后大概如下：

![PointLight](3.png)

这里的阴影是上一个聚光灯光源产生的效果，可以使用下面代码把聚光灯光源去掉，那么就只有点光源的效果了。

 ```JavaScript
spotLight.visible = false;
```

此时的效果大概如下：

![只有PointLight](4.png)

这一块建议运行一下代码，代码中可以更好的测试各个参数。

## DirectionalLight ##

[DirectionalLight](https://threejs.org/docs/index.html#api/en/lights/DirectionalLight)顾名思义是一种平行的直线光源（平行光光源）。**平行光光源的光线是平行的，可以产生阴影，所有光的强度都一样。**它有一个`target`属性表示照射到哪个位置上，另外可以使用`directionalLight.shadow.camera.left`或者`directionalLight.shadowCameraLeft`来设置阴影的左边距，同样的也可以设置右边、上边、下边等边距，这样就可以确定一个阴影的范围（阴影越大性能会越差，所以平行光需要设置阴影范围）。

我们把第一个例子中的聚光灯光源换成平行光光源，如下：

```JavaScript
// 添加光源
var directionalLight = new THREE.DirectionalLight('#ffffff');
directionalLight.position.set(0, obj.y, 0);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 512;  // default
directionalLight.shadow.mapSize.height = 512; // default
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 1000;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
scene.add(directionalLight);

// 光照指向平地
directionalLight.target = plane;
```

此时的效果大概如下：

![DirectionalLight](5.png)

## AmbientLight ##

[AmbientLight](https://threejs.org/docs/index.html#api/en/lights/AmbientLight)的**作用是给场景添加一种全局的颜色**。该光源**没有方向，也不产生阴影**。如果你需要给场景中添加一种额外的统一的颜色，那么可以考虑使用`AmbientLight`，比如在上一个例子中添加一种紫色来烘托氛围，那么就可以使用该光源。

```JavaScript
var ambientLight = new THREE.AmbientLight('#9370DB');
scene.add(ambientLight);
```

上述效果如下：

![AmbientLight](6.png)

## HemisphereLight ##

上述`AmbientLight`主要的作用就是给环境中添加一种颜色，还有一种给环境中添加颜色的光源，就是[HemisphereLight](https://threejs.org/docs/index.html#api/en/lights/HemisphereLight)。`HemisphereLight`是一种更加贴近自然的光源，它的第一个参数表示天空的颜色，第二个参数表示地面（或者环境）的颜色，第三个参数是`intensity`表示强度。我们把上个例子中的`AmbientLight`替换为`HemisphereLight`，如下：

```JavaScript
var hemisphereLight = new THREE.HemisphereLight('#87ceeb', '#f5deb3', 0.4);
scene.add(hemisphereLight);
```

上述效果如下：

![HemisphereLight](7.png)
