---
title: Nuxt项目给script标签添加crossorigin属性
date: 2020-01-06 16:01:03
tags:
  - Nuxt
categories: 配置
---

最近给项目添加一个错误日志上报的功能，由于使用的是第三方的服务，导致上报的错误信息都是`Script error.`。[文档](https://help.aliyun.com/knowledge_detail/88579.html?spm=5176.13394938.0.0.4ef27294Z7EriM)上写的很清楚，要处理这个问题只需要两步：`添加“crossorigin="anonymous" 属性`和`添加跨域 HTTP 响应头`。那么Nuxt项目该如何添加`crossorigin`呢？

----

## 给单页应用添加crossorigin ##

单页应用意味着`nuxt.config.js`中`mode`的值是`spa`。spa添加`crossorigin`很简单，官方文档上也有[说明](https://zh.nuxtjs.org/api/configuration-build/#crossorigin)，只要在`nuxt.config.js`文件中的build属性下添加`crossorigin: 'anonymous'`就可以了。你可以运行`npm run build`，然后查看项目根目录下的`.nuxt/dist/server/index.spa.html`文件，其中script标签是有`crossorigin`属性的。

## 给同构应用添加crossorigin ##

同构应用（即使用了服务端渲染）意味着`nuxt.config.js`中`mode`的值是`universal`。此时再用上面的方法发现上述的`.nuxt/dist/server/index.spa.html`文件是加了`crossorigin`属性的，但是服务端渲染的文件`.nuxt/dist/server/index.ssr.html`却没有，其内容大概如下：

```HTML
<!doctype html>
<html {{ html_attrs }}>

<head>
  <!-- 省略部分内容 -->
</head>
<body {{ body_attrs }}>
  <!-- built files will be auto injected -->
  {{ APP }}
</body>

</html>
```

实际运行的时候`script`标签是服务端渲染时动态在上述APP变量处生成的，这个时候我们就需要对渲染的HTML模板APP处进行修改，可以直接使用`Nuxt`的钩子函数，在`nuxt.config.js`文件，导出的json中添加如下代码：

```JavaScript
hooks: {
  'vue-renderer': {
    ssr: {
      templateParams(templateParams) {
        templateParams.APP = templateParams.APP.replace(
          /<script/gi,
          '<script crossorigin'
        )
      }
    }
  }
}
```

`Nuxt`更多hooks相关内容可以看[这里](https://zh.nuxtjs.org/api/configuration-hooks/#hooks-%E5%B1%9E%E6%80%A7)。

## 编译时添加crossorigin ##

还有一种情况就是类似于`动态import`，他生成script标签的时候是受babel来控制的。这时就需要修改webpack打包时候的配置了，好在`Nuxt`是支持修改配置的，再修改`nuxt.config.js`文件如下：

```JavaScript
build:{
  // ... 其他配置
  extend(config) {
    config.output.crossOriginLoading = 'anonymous'
  },
}
```

webpack配置`crossOriginLoading`可以看[这里](https://www.webpackjs.com/configuration/output/#output-crossoriginloading)。

## 总结 ##

综上，需要在`nuxt.config.js`文件中添加如下代码：

```JavaScript
module.exports = {

  build:{
    // ... 其他配置

    extend(config) {
      config.output.crossOriginLoading = 'anonymous'
    },
  },

  hooks: {
    'vue-renderer': {
      ssr: {
        templateParams(templateParams) {
          templateParams.APP = templateParams.APP.replace(
            /<script/gi,
            '<script crossorigin'
          )
        }
      }
    }
  }
}

```
