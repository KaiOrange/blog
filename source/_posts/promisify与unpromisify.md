---
title: promisify与unpromisify
date: 2021-01-18 20:10:59
author: Orange
tags:
  - 异步
categories: JavaScript
---

Promise是JavaScript中一种常用的异步处理的方式，它可以有效地避免回调地狱。那么`promisify`是什么意思呢？在英语中`ify`结尾的单词一般为动词，表示“使……化”，那么很显然`promisify`就是“使Promise化”，通俗一点就是把回调函数转化为Promise这种形式。

### promisify ###

`promisify`的代码相对来说比较简单，这里直接给出代码：

```JavaScript
function promisify(fn) {
  return (...rest) => {
    return new Promise((resolve, reject) => {
      fn(...rest, (err, result) => {
        if(err){
          reject(err)
          return
        }
        resolve(result)
      })
    })
  }
}
```

假设我们在node中的`fs.readFile`方法上使用它，那么有：

```JavaScript
const fs = require('fs')

const redFilePromise = promisify(fs.readFile)
redFilePromise('./data.json','utf-8').then(data => {
  console.log(data)
})
```

### unpromisify ###

由于Promise比回调方式更优雅，所以很少有人会把Promise再转回回调方法，在讲`unpromisify`之前我们先写一个Promise版本的`delay`函数：

```JavaScript
function delay(timeout) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, timeout)
  })
}

delay(1000).then(() => {
  console.log('这里一秒后调用！')
})
```

现在定义一个`unpromisify`函数，将`delay`函数改成回调函数的版本：

```JavaScript
function unpromisify (p, done) {
  p.then(
    data => done(null, data),
    err => done(err)
  )
}

unpromisify(delay(1000), () => {
  console.log('回调函数中一秒后调用！')
})
```

### 现成的promisify ###

node的util模块提供了`promisify`函数，可以直接拿来使用。由于很少需要`unpromisify`，所以该模块中并没有提供`unpromisify`。

```JavaScript
const fs = require('fs')
const util = require('util')

// node util模块中的promisify方法
const redFilePromise = util.promisify(fs.readFile)
redFilePromise('./data.json','utf-8').then(data => {
  console.log(data)
})
```
