---
title: 《JavaScript DOM 编程艺术》小记
date: 2022-07-24 15:24:07
author: Orange
tags:
  - JavaScript
categories: 读书笔记
---

1. 在HTML中的Script块中可以使用HTML注释，甚至可以不写结尾。如，以下代码都是可以正常运行的。

```HTML
<script type="text/JavaScript">
  console.log(1);
  <!-- 运行后打印1 1 -->
  console.log(1);
</script>
```

```HTML
<script type="text/JavaScript">
  console.log(2);
  <!-- 运行后打印2 2
  console.log(2);
</script>
```

2.常用DOM操作：

```JavaScript
document.getElementById(elementId); // 根据id来获取DOM元素
document.getElementsByTagName(tagName); // 通过tagName来获取元素
document.getElementsByClassName(classNames); // 通过classNames来获取元素
dom.setAttribute(name, value); // 设置属性的值
dom.getAttribute(name); // 获取属性的值
dom.childNodes; // 获取子元素
dom.nodeType; // 获取节点类型 1:元素节点 2:属性节点 3:文本节点
textNode.nodeValue = '文本'; // 修改文本节点的值
document.write(text); // 全页面写入文档
dom.innerHTML; // 获取DOM中的HTML文本
dom.innerHTML = text; // 设置DOM中的HTML
dom.innerText; // 获取DOM中的文本（省略HTML标签）
dom.innerText = text; // 设置DOM中的文本
document.createElement(nodeName); // 创建一个元素
document.createTextNode(text); // 创建一个文本节点
dom.appendChild(node); // 追加一个节点
dom.insertBefore(node, child); // 将node插在父元素dom的child元素之前
dom.style.fontSize = value; // 设置样式
```

3.不同的设置属性方式：

```JavaScript
// 给input设置值
inputDom.setAttribute('value', value);
inputDom.value = value;

// 给img设值图片
imgDom.setAttribute('src', src);
imgDom.src = src;

// 给a设值href
aDom.setAttribute('href', href);
aDom.href = href;

// 给dom设值class
dom.setAttribute('class', className);
dom.className = className;
```

4.打开一个打开一个320px * 480px的小窗口：

```JavaScript
window.open(url, "popup", "width=320,height=480");
```

5.实现一个addLoadEvent函数，支持添加多个window.onload函数：

```JavaScript
function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      oldonload();
      func();
    }
  }
}
```

6.实现一个insertAfter函数支持把元素追加到某个元素之后：

```JavaScript
function insertAfter(newElement, targetElement) {
  var parent = targetElement.parentNode;
  if (parent.lastChild == targetElement) {
    parent.appendChild(newElement);
  } else {
    parent.insertBefore(newElement,targetElement.nextSibling);
  }
}
```

7.实现一个addClass函数给指定节点追加类名：

```JavaScript
function addClass(element, value) {
  if (!element.className) {
    element.className = value;
  } else {
    element.className += " ";
    element.className += value;
  }
}
```

8.实现一个moveElement动画函数，可以把指定元素移动到目标位置：

```JavaScript
function moveElement(elementID, final_x, final_y, interval) {
  if (!document.getElementById) return false;
  if (!document.getElementById(elementID)) return false;
  var elem = document.getElementById(elementID);
  if (elem.movement) {
    clearTimeout(elem.movement);
  }
  if (!elem.style.left) {
    elem.style.left = "0px";
  }
  if (!elem.style.top) {
    elem.style.top = "0px";
  }
  var xpos = parseInt(elem.style.left);
  var ypos = parseInt(elem.style.top);
  if (xpos == final_x && ypos == final_y) {
    return true;
  }
  if (xpos < final_x) {
    var dist = Math.ceil((final_x - xpos)/10);
    xpos = xpos + dist;
  }
  if (xpos > final_x) {
    var dist = Math.ceil((xpos - final_x)/10);
    xpos = xpos - dist;
  }
  if (ypos < final_y) {
    var dist = Math.ceil((final_y - ypos)/10);
    ypos = ypos + dist;
  }
  if (ypos > final_y) {
    var dist = Math.ceil((ypos - final_y)/10);
    ypos = ypos - dist;
  }
  elem.style.left = xpos + "px";
  elem.style.top = ypos + "px";
  var repeat = "moveElement('"+elementID+"',"+final_x+","+final_y+","+interval+")";
  elem.movement = setTimeout(repeat,interval);
}
```

9.使用JavaScript实现把指定图片设置为黑白图片，鼠标经过时候图片变成彩色的效果：

```JavaScript
function convertToGS(img) {
  // 存储原始图片
  img.color = img.src;

  // 存储黑白图片
  img.grayscale = createGSCanvas(img);

  // 鼠标经过和移除时候切换图片
  img.onmouseover = function() {
    this.src = this.color;
  }
  img.onmouseout = function() {
    this.src = this.grayscale;
  }
}

function createGSCanvas(img) {
  var canvas=document.createElement("canvas");
  canvas.width=img.width;
  canvas.height=img.height;
  var ctx=canvas.getContext("2d");
  ctx.drawImage(img,0,0);

  // 注：getImageData方法只有在Web环境中才能生效 直接用浏览器打开HTML会报错
  var c = ctx.getImageData(0, 0, img.width, img.height);
  for (i=0; i<c.height; i++) {
    for (j=0; j<c.width; j++) {
      var x = (i*4) * c.width + (j*4);
      var r = c.data[x];
      var g = c.data[x+1];
      var b = c.data[x+2];
      c.data[x] = c.data[x+1] = c.data[x+2] = (r+g+b)/3;
    }
  }
  ctx.putImageData(c,0,0,0,0, c.width, c.height);
  return canvas.toDataURL();
}

// 注：需要再Web环境中才能看到效果
window.onload = function() {
  convertToGS(document.getElementById('avatar'));
}
```
