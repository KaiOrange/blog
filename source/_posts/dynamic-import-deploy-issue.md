---
title: 动态import来拆分代码后发布问题
date: 2019-01-30 15:25:54
tags: 
  - dynamic import
categories: javascript
---
当使用SPA（单页应用）的时候，为了提高性能，我们经常使用`动态import`来拆分代码。这种情况发布的时候可能会有这样的问题：

假如用户在发布前已经进入该应用，当用户在发布后再进入某个引入分片代码的的界面，那么很可能页面静态资源的路径是旧的，而服务器新发布的资源路径是新的（大多数路径不一样是文件名的hash值不同导致的，我们这里也假设是这样情况），那么两个路径不一样，从而导致`404`的发生。

我们这里讲一种简单的处理方法：

1. 设置HTML不缓存

```HTML
<meta http-equiv="Cache" content="no-cache">
<meta http-equiv="Cache-control" content="no-cache">
```

2. 给动态引入的JS加上hash值，这一块不懂的可以看[这篇文章](/blog/2019/01/30/dynamic-import-named/ "webpack中动态import()打包后的文件名称定义")

```javascript
//动态import处代码
import(/* webpackChunkName: "[request]" */`../../containers/${requestPath}`)
```

```javascript
//webpack.config.js
//... 其他代码
output: {
    //... 其他代码
    filename: '[name].[hash].js',
    chunkFilename: '[name].[hash].js',//这里使用hash,也可以是其他的hash具体按自己的项目来定
},
//... 其他代码
```

3. 设置缓存头信息

```javascript
//我这里使用的是koa2做为服务器的 根据使用的服务器来设置响应头信息就可以了
app.use(require('koa-static')(__dirname + '/public',{
    maxage:1209600000//这个时间根据具体的项目来自己定
}))
```

通过上述步骤就可以了，当用户在发布后再进入某个引入分片代码的的界面，那么页面中的引用是旧的资源路径，由于页面有缓存那么不会报错。当用户新进入页面的时候（比如刷新一下）那么由于`HTML`文件是不缓存的，它引入的`js`也是新的路径，而分片路径也是新的，所以界面就不会报错了。

这里需要注意的一点就是服务端新发布的代码最好可以兼容一下旧的界面，比如旧的界面要报个错什么的。