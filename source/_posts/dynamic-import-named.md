---
title: webpack中动态import()打包后的文件名称定义
date: 2019-01-30 15:14:38
tags: 
  - dynamic import
categories: JavaScript
---

动态`import()`打包出来文件的name是按照`0,1,2...`依次排列，如`0.js`、`1.js`等，有的时候我们希望打包出来的文件名是打包前的文件名称。要实现这，需要经历3个步骤：
1.在`webpack`配置文件中的`output`中添加`chunkFilename`。命名规则根据自己的项目来定，其中`[name]`就是文件名，这一块更详细的说明请[点击这里](https://www.webpackjs.com/configuration/output/#output-chunkfilename "chunkfilename")。
```JavaScript
//其他代码...
output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].[hash:8].js',
    chunkFilename: '[name].[hash:8].js',//动态import文件名
},
//其他代码...
```
2.在动态`import()`代码处添加注释`webpackChunkName`告诉webpack打包后的chunk的名称（注释中的内容很重要，不能省掉），这里打包以后的name就是MyFile。
```JavaScript
import(/* webpackChunkName: "MyFile" */`../containers/MyFile`)
```
3.大多数情况下我们使用动态`import()`是通过循环来做的，这样我们就不得不引入变量了，使用`[request]`来告诉webpack，这里的值是根据后面传入的字符串来决定，本例中就是变量`pathName`的值，具体如下：
```JavaScript
import(/* webpackChunkName: "[request]" */`../containers/${pathName}`)
```