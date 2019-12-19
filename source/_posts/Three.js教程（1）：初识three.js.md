---
title: Three.js教程（1）：初识three.js
date: 2019-12-19 10:13:08
author: Orange
tag:
	- Three.js
categories: Three.js
---

今天开始我们进入一个新的世界，那就是3D世界。由于我自己也是刚接触到这块内容，所以如果文章中有问题，请尽快在文章最后的留言板中请指出。本教程有配套代码仓库，请点击[https://github.com/KaiOrange/three.js-demo](https://github.com/KaiOrange/three.js-demo)。

----

## 为什么要使用three.js ##

要回答为什么要使用[three.js](https://github.com/mrdoob/three.js)？首先我们想想什么是three.js？官方给的简绍很简单：`JavaScript 3D library`，就是一个JavaScript的3D库。前端实现3D效果无非这么几种方式：

> 1.CSS 3D技术；
> 2.SVG；
> 3.WebGL技术；
> 4.Canvas或者图片等来模拟3D。

其中最后一种是用其他技术或方法去模拟3D效果，前3种才是浏览器真正意义上支持的3D技术。而three.js直接支持前3种渲染方式，可以看出three.js的强大。
大多情况下如果是为了展示3D的效果，那么直接用图片就可以了，如果要动起来的话，视频往往可以胜任。但是如果有交互视频就不行了，前端的3D技术弥补了视频的交互部分。而交互中逻辑性比较多，这样的话JavaScript来做会更有优势，所以WebGL技术就脱颖而出，首先我们来看一个WebGL的例子：

```HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <canvas id="webgl" width="500" height="500"></canvas>
  <script>
    var projectionMatrix = new Float32Array(
      [2.41421, 0, 0, 0,
      0, 2.41421, 0, 0,
      0, 0, -1.002002, -1,
      0, 0, -0.2002002, 0]);
    var modelViewMatrix = new Float32Array(
      [1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, -3.333, 1]);

    // Create the vertex data for a square to be drawn
    function createSquare(gl) {
      var vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      var verts = [
        .5,  .5,  0.0,
        -.5,  .5,  0.0,
        .5, -.5,  0.0,
        -.5, -.5,  0.0
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
      var square = {buffer:vertexBuffer, vertSize:3, nVerts:4, primtype:gl.TRIANGLE_STRIP};
      return square;
    }
    function createShader(gl, str, type) {
      var shader;
      if (type == "fragment") {
          shader = gl.createShader(gl.FRAGMENT_SHADER);
      } else if (type == "vertex") {
          shader = gl.createShader(gl.VERTEX_SHADER);
      } else {
          return null;
      }
      gl.shaderSource(shader, str);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert(gl.getShaderInfoLog(shader));
          return null;
      }
      return shader;
    }

  var vertexShaderSource =
    "attribute vec3 vertexPos;\n" +
    "uniform mat4 modelViewMatrix;\n" +
    "uniform mat4 projectionMatrix;\n" +
    "void main(void) {\n" +
    "   // Return the transformed and projected vertex value\n" +
    "   gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "   vec4(vertexPos, 1.0);\n" +
    "}\n";

  var fragmentShaderSource =
    "void main(void) {\n" +
    "   // Return the pixel color: always output white\n" +
    "   gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n" +
    "}\n";

    var shaderProgram, shaderVertexPositionAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;
    function initShader(gl) {
      // load and compile the fragment and vertex shader
      var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
      var vertexShader = createShader(gl, vertexShaderSource, "vertex");
      // link them together into a new program
      shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);
      // get pointers to the shader params
      shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
      gl.enableVertexAttribArray(shaderVertexPositionAttribute);

      shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
      shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
          alert("Could not initialise shaders");
      }
    }
    function draw(gl, obj) {
      // clear the background (with black)
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      // set the vertex buffer to be drawn
      gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
      // set the shader to use
      gl.useProgram(shaderProgram);
      // connect up the shader parameters: vertex position and projection/model matrices
      gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);
      gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
      gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, modelViewMatrix);
      // draw the object
      gl.drawArrays(obj.primtype, 0, obj.nVerts);
    }

    window.onload = function (){
      var canvas = document.getElementById("webgl");
      var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      gl.viewport(0, 0, canvas.width, canvas.height);
      var square = createSquare(gl);
      initShader(gl);
      draw(gl, square);
    }
  </script>
</body>
</html>
```

这段代码比较长，出来的效果很简单，只是一个小方块（只是一个正方形，还不是正方体）。具体效果如下：

![WebGL实现小方块](1.png)

我们来简单的看一下代码吧，代码中通过`canvas.getContext("webgl")`来获取到`WebGL`的上下文，对于稍微低版本的浏览器可以使用`experimental-webgl`来获取，还记得之前canvas吗？当时是通过`2d`来获取canvas的上下文对象。上述代码中，核心代码是`initShader()`方法，它初始化了[着色器](https://baike.baidu.com/item/%E7%9D%80%E8%89%B2%E5%99%A8/411001?fr=aladdin)，我们这里用到了2个着色器：fragmentShader和vertexShader。正如他们的命名一样，第一个是`片元着色器`，第二个是`顶点着色器`。上述中还有2段String类型的代码，也就是字符串`vertexShaderSource`和字符串`fragmentShaderSource`的值，这两段代码是一种被称作`GLSL ES`的着色器语言（Shading Language），其实WebGL这一套都是来自于一种叫做OpenGL的技术，完全可以理解为WebGL提供了一层API来调用系统底层的OpenGL。也就是说WebGL把字符串的`GLSL ES`代码变成系统可以执行的OpenGL的代码，期间经过`compileShader(),shaderSource(),compileShader(),attachShader()linkProgram()`等多个JS方法。

到这里估计你也头大了，什么着色器，什么`GLSL ES`，什么Shader，把人搞的痛苦地！！！别急，正因为原生的WebGL这么晦涩难懂，所以才有了我们的主角three.js。现在你可以忘掉上面的内容，因为three.js封装的特别好，根本看不到任何WebGL的影子，你再也不需要去了解什么着色器，更不用写`GLSL ES`，我们先来看一个更高级且更简单的three.js的例子。

## 初识three.js ##

three.js可以使用模块化引入，当然也可以直接用`script标签`来引入。在具体项目中完全可以搭配React和Vue这样的MVVM框架，这里图简单就直接用`script标签`来引入。当写这篇文章的时候three.js的最新版本是`r111`，你可以在[这里](https://github.com/mrdoob/three.js/releases)查看最新的版本。

我们首先来运行一下官方给的例子，源代码点击[这里](https://github.com/KaiOrange/three.js-demo/blob/master/01/02_%E5%88%9D%E8%AF%86three.js.html)：

```HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
  <style>
    *{
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <script type="text/javascript" src="../node_modules/three/build/three.js"></script>
  <script type="text/javascript">
    var camera, scene, renderer;
    var geometry, material, mesh;

    function init() {
      camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
      camera.position.z = 1;

      scene = new THREE.Scene();

      geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
      material = new THREE.MeshNormalMaterial();
      mesh = new THREE.Mesh( geometry, material );
      scene.add( mesh );

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize( window.innerWidth, window.innerHeight );
      document.body.appendChild( renderer.domElement );
    }

    function animate() {
      requestAnimationFrame( animate );
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.02;
      renderer.render( scene, camera );
    }

    init();
    animate();
  </script>
</body>
</html>
```

代码非常少，出来的效果却是很惊艳：

![初识three.js](2.png)

我们来分析一下官方例子的代码，首先创建了一个相机（THREE.PerspectiveCamera），它描述了眼睛看的方向；然后创建了一个场景（THREE.Scene）；再之后把小物块（THREE.Mesh）放在场景上；最后渲染出来（THREE.WebGLRenderer）的DOM元素（canvas）追加到body上。`animate`函数的作用是启动动画，动画的原理就是每次改变一点点，然后重新渲染，这跟Canvas是一模一样的，不了解这块的同学可以看看[这篇](/2019/06/30/Canvas系列（10）：动画初级/#more)。
最后我们给出一张图来结束本章，这个就是three.js的基本模式，其中光线我们还没有涉及到：

![对象架构](3.png)
