---
title: H5 history API
date: 2023-04-18 11:11:37
author: Orange
tags:
  - JavaScript
categories: JavaScript
---

对于JS中[history](https://developer.mozilla.org/zh-CN/docs/Web/API/History)对象我们最常用的就是`back()`、`forward()`、`go()`三个方法，H5新增了`pushState()`和`replaceState()`用来无刷新页面来更新URL地址，本章所说的H5 history API也指的是这两个方法。

H5 history API浏览器兼容情况[请看这里](https://caniuse.com/?search=history.pushState)。

> PS：虽然H5已经不是什么新东西了，但学学总没害处。

----

### pushState ###

pushState根据API的意思是向浏览器的历史栈中添加一个状态，这个函数本来是用来添加状态的，而附加能力是修改URL，所以第一个参数是状态，最后一个参数才是URL，URL是可选的，如果不写URL则URL不会变，但是仍然会在历史栈中添加一条数据，点击浏览器的回退按钮会出栈这条历史信息，相当于页面回到原来的状态，页面内容并没有变化。其签名如下：

```JavaScript
history.pushState(state, title[, url])
```

pushState第一个参数是状态，这个状态state可以是**可结构化拷贝的任意类型**，传对象、传数字、传布尔都没问题。第二个是标题，但是浏览器压根不鸟它，你设置了也不会修改浏览器标题，所以我们一般传入`null`就可以了。第三个是URL，一般是一个字符串，新版本浏览器对URL对象（`new URL()`这种）也是支持的，但考虑到兼容性还是使用字符串比较好，需要注意的是URL必须是跟当前页面地址是**同源**的。

来看一个简单的例子：

```JavaScript
const state = {
    msg: '我是状态'
};

history.pushState(state, null, '/a');

console.log(history.state); // 打印 state 即 { msg: '我是状态' }
```

上述state是一个对象，调用pushState会在历史栈中增加一条信息，同时修改URL的pathName为`/a`。如果把上述state的值修改为`123`，那么调用pushState后`history.state`就变成了`123`。但是需要注意的是`history.state !== state`，这里采用了结构化深拷贝，相当于调用了`structuredClone(state)`，结构化深拷贝不仅可以拷贝基本类型，而且对象在存在循环引用也是可以拷贝成功的，比`JSON.parse(JSON.stringify(state))`要更加安全。浏览器原生的structuredClone方法目前兼容性还不够好，其相关内容可以[看这里](https://developer.mozilla.org/zh-CN/docs/web/api/structuredClone)。当然结构化深拷贝也不是万能的，对于dom节点，error对象、function函数来说也会拷贝失败，上述stete传这些类型的值时，会报错。

第三个参数URL又可分为这几种情况，比如当前路径为`https://www.kai666666.com/2023/04/18/H5-history-API/?1=1#more`（这里为了方便查看search的情况，添加了一个`1=1`的参数）。

URL情况|处理情况|url值|url处理结果
---|---|---|---
URL全路径|整体替换|`https://www.kai666666.com/a`|`https://www.kai666666.com/a`
`/`开头|替换pathName部分|`/a`|`https://www.kai666666.com/a`
`./`开头|替换当前路径，也就是最后一位|`./a`|`https://www.kai666666.com/2023/04/18/H5-history-API/a`
`../`开头|替换上一级|`../a`|`https://www.kai666666.com/2023/04/18/a`
`?`开头|替换search部分|`?2=2`|`https://www.kai666666.com/2023/04/18/H5-history-API/?2=2`
`#`开头|替换hash部分|`#hash`|`https://www.kai666666.com/2023/04/18/H5-history-API/?1=1#hash`
`单词或数字`开头|替换当前路径部分，等价与`./单词或数字`开头|`aaa`|`https://www.kai666666.com/2023/04/18/H5-history-API/aaa`

这里有几点需要注意一下。首先地址最后一位有没有`/`会影响到当前路径和上一级路径的判断，如果有`/`则认为当前路径是斜杠后面的路径，虽然后面是空的。举个例子URL`https://www.kai666666.com/2023/04/18/H5-history-API/`和`https://www.kai666666.com/2023/04/18/H5-history-API`调用`history.pushState(state, null, './a');`得到的结果分别是`https://www.kai666666.com/2023/04/18/H5-history-API/a`和`https://www.kai666666.com/2023/04/18/a`。

第二点需要注意的是`/`开头的路径将会把search和hash部分也替换掉；`?`开头的路径会把hash部分也替换的，如果需要保留则需要手动添加对应的部分，如\`/a${location.search}${location.hash}\`。

当前路径与上一级路径也可以混用：

```JavaScript
history.pushState(null, null, './a/../b/c');
// 路径修改为 https://www.kai666666.com/2023/04/18/H5-history-API/b/c
```

对了URL路径中只有`./`或者`../`可以省略后面的`/`。

```JavaScript
history.pushState(null, null, '..');
// 替换到上一级目录 路径修改为 https://www.kai666666.com/2023/04/18/
```

最后如果URL中含有中文，调用`location.pathname`得到的是转码后的内容。

```JavaScript
history.pushState(null, null, '/你好');
console.log(location.pathname)// /%E4%BD%A0%E5%A5%BD
```

### replaceState ###

replaceState与pushState用法一模一样，区别是replaceState是把当前的历史栈替换了，而pushState是添加了一个历史栈，这样就导致replaceState点返回按钮会回到上一个历史栈中。replaceState的签名如下：

```JavaScript
history.replaceState(stateObj, title[, url]);
```

### base元素对路径的影响 ###

HTML中base元素提供了基础的路径，如果设置了base，那么相对路径都是基于base元素中的路径来算出新的路径的。

```HTML
<base href="/base/aaa">
```

如添加如上base元素后，上述情况处理的结果如下：

URL情况|url值|url处理结果
---|---|---
URL全路径|`https://www.kai666666.com/a`|`https://www.kai666666.com/a`
`/`开头|`/a`|`https://www.kai666666.com/a`
`./`开头|`./a`|`https://www.kai666666.com/base/a`
`../`开头|`../a`|`https://www.kai666666.com/a`
`?`开头|`?2=2`|`https://www.kai666666.com/base/aaa?2=2`
`#`开头|`#hash`|`https://www.kai666666.com/base/aaa#hash`
`单词或数字`开头|`bbb`|`https://www.kai666666.com/base/bbb`

### popstate事件 ###

popstate事件是浏览器历史栈返回或者前进的时候会触发，调用`history.pushState()`和`history.replaceState()`方法的时候并不会触发popstate事件，只有hash改变或者调用这两个函数后并点击浏览器的前进/后退或者使用JS API前进/后退（如调用`history.back()`、`history.go(-1)`或`history.forward()`）的时候才会触发。

```JavaScript
window.addEventListener('popstate', (event) => {
  console.log(event.state); // 这里可以获取到状态
})
```

如果不修改hash或不调用者两个函数的时候，直接前进后退一般都是会刷新页面，也就不会触发事件回调函数。当然你也可以手动触发popstate事件。

```JavaScript
window.dispatchEvent(new PopStateEvent('popstate'));
```
