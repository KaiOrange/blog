---
title: 源码共读-Koa
date: 2023-05-23 09:54:49
author: Orange
tags:
  - 源码共读
categories: 源码共读
---

[Koa](https://koa.bootcss.com/)是基于 Node.js 平台的下一代 web 开发框架，它的源码可以[看这里](https://github.com/koajs/koa)，本章通过源码来简绍一下Koa是怎么实现的。

## 核心代码 ##

Koa的核心代码只有4个文件，如图。

![核心代码](1.png)

各个文件的作用：

`application.js`：Koa的核心，对应Koa App类。
`context.js`：对应上下文对象ctx。
`request.js`：对应ctx.request对象。
`response.js`：对应ctx.response对象。

## Koa实现 ##

### Koa使用 ###

Koa使用如下：

```JavaScript
const Koa = require('koa');
const app = new Koa();

app.use(ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000, () => {
  console.log("服务器启动成功!");、
});
```

Koa底层是基于原生http模块，原生http模块怎么启动一个服务呢？如下：

```JavaScript
const http = require('http');

const server = http.createServer(function(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end("Hello World");
});

server.listen(3000, () => {
  console.log("服务器启动成功!");、
});
```

观察上面的代码，两者是不是挺像的。

### application源码 ###

为了方便查看application的核心逻辑，下面是我去掉了部分非核心代码的application源码：

```JavaScript
const onFinished = require('on-finished')
const response = require('./response')
const compose = require('koa-compose')
const context = require('./context')
const request = require('./request')
const statuses = require('statuses')
const Emitter = require('events')
const Stream = require('stream')
const http = require('http')

class Application extends Emitter {
  constructor (options) {
    super()
    options = options || {}
    this.env = options.env || process.env.NODE_ENV || 'development'
    this.compose = options.compose || compose
    if (options.keys) this.keys = options.keys
    this.middleware = []
    this.context = Object.create(context)
    this.request = Object.create(request)
    this.response = Object.create(response)
  }

  listen(...args) {
    const server = http.createServer(this.callback())
    return server.listen(...args)
  }

  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!')
    this.middleware.push(fn)
    return this
  }

  callback() {
    const fn = this.compose(this.middleware)
    if (!this.listenerCount('error')) this.on('error', this.onerror)

    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res)
      return this.handleRequest(ctx, fn)
    }
    return handleRequest
  }

  handleRequest(ctx, fnMiddleware) {
    const res = ctx.res
    res.statusCode = 404
    const onerror = err => ctx.onerror(err)
    const handleResponse = () => respond(ctx)
    onFinished(res, onerror)
    return fnMiddleware(ctx).then(handleResponse).catch(onerror)
  }

  createContext(req, res)
    const context = Object.create(this.context)
    const request = context.request = Object.create(this.request)
    const response = context.response = Object.create(this.response)
    context.app = request.app = response.app = this
    context.req = request.req = response.req = req
    context.res = request.res = response.res = res
    request.ctx = response.ctx = context
    request.response = response
    response.request = request
    context.originalUrl = request.originalUrl = req.url
    context.state = {}
    return context
  }

  onerror(err) {
    if (err.status === 404 || err.expose) return
    if (this.silent) return

    const msg = err.stack || err.toString()
    console.error(`\n${msg.replace(/^/gm, '  ')}\n`)
  }
}

function respond (ctx) {
  // allow bypassing koa
  if (ctx.respond === false) return

  if (!ctx.writable) return

  const res = ctx.res
  let body = ctx.body
  const code = ctx.status

  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    ctx.body = null
    return res.end()
  }

  if (ctx.method === 'HEAD') {
    if (!res.headersSent && !ctx.response.has('Content-Length')) {
      const { length } = ctx.response
      if (Number.isInteger(length)) ctx.length = length
    }
    return res.end()
  }

  // status body
  if (body == null) {
    if (ctx.response._explicitNullBody) {
      ctx.response.remove('Content-Type')
      ctx.response.remove('Transfer-Encoding')
      ctx.length = 0
      return res.end()
    }
    if (ctx.req.httpVersionMajor >= 2) {
      body = String(code)
    } else {
      body = ctx.message || String(code)
    }
    if (!res.headersSent) {
      ctx.type = 'text'
      ctx.length = Buffer.byteLength(body)
    }
    return res.end(body)
  }

  // responses
  if (Buffer.isBuffer(body)) return res.end(body)
  if (typeof body === 'string') return res.end(body)
  if (body instanceof Stream) return body.pipe(res)

  // body: json
  body = JSON.stringify(body)
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body)
  }
  res.end(body)
}
```

当调用`app.use`的时候，实际上是把中间件函数加入到`this.middleware`数组当中。
当调用`app.listen`的时候，通过`http.createServer`来创建http服务并使用`server.listen`来监听服务。
这里比较难理解的是`callback`函数，它使用`compose`将中间件合并成一个调用函数，具体怎么合并的我们稍后再说。如果`error`事件没有监听的话，添加一个默认的监听函数，默认的`onerror`函数实际上就是打印错误信息；`this.listenerCount`是从哪里来的呢？实际上`Application`类是继承自node中的`Emitter`，该方法也是[Emitter的方法](https://nodejs.org/dist/latest-v18.x/docs/api/events.html#emitterlistenercounteventname-listener)。最后返回了一个`handleRequest`函数，该函数做了2件事，首先通过`req`和`res`构建`ctx`，然后调用`this.handleRequest`，注意`this.handleRequest`是`Application`类的属性而不是`callback`中的`handleRequest`，也就是这里并没有递归调用。
在`this.handleRequest`函数中调用了中间件函数`fnMiddleware(ctx)`，当中间件函数都调用完了以后调用`respond(ctx)`，`respond`通过不同的情况去处理res的结果；失败的时候调用`ctx.onerror(err)`。另外在中间件处理之前会调用`onFinished(res, onerror)`来监听出错的情况，onFinished的代码请[看这里](https://github.com/jshttp/on-finished)。

### koa-compose源码 ###

在讲述源码之前我们先看看`koa-compose`中间件是怎么使用的。

```JavaScript
const Koa = require('koa');
const app = new Koa();

app.use(async(ctx, next) => {
  console.log('第1个中间件开始');
  await next();
  console.log('第1个中间件结束');
});

app.use(async(ctx, next) => {
  console.log('第2个中间件开始');
  await next();
  console.log('第2个中间件结束');
});

app.use(async(ctx, next) => {
  console.log('第3个中间件开始');
  await next();
  console.log('第3个中间件结束');
});

app.listen(3000, () => {
  console.log("服务器启动成功!");
});
```

客户端打印:

```Text
第1个中间件开始
第2个中间件开始
第3个中间件开始
第3个中间件结束
第2个中间件结束
第1个中间件结束
```

这就是Koa中间件著名的洋葱模型。

![洋葱模型](2.png)

我们先不谈Koa只看看`koa-compose`做了什么事。

```JavaScript
const compose = require('koa-compose');

const middleware = [
  async(ctx, next) => {
    console.log('第1个中间件开始');
    await next();
    console.log('第1个中间件结束');
  },
  async(ctx, next) => {
    console.log('第2个中间件开始');
    await next();
    console.log('第2个中间件结束');
  },
  async(ctx, next) => {
    console.log('第3个中间件开始');
    await next();
    console.log('第3个中间件结束');
  }
];
const fn = compose(middleware);
const ctx = {};
fn(ctx).then(() => {
  console.log('处理完成了');
});
```

上面打印：

```Text
第1个中间件开始
第2个中间件开始
第3个中间件开始
第3个中间件结束
第2个中间件结束
第1个中间件结束
处理完成了
```

`koa-compose`把多个中间件合并成一个函数，通过`await next()`来调用下一个中间件，其源码如下：

```JavaScript
function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

首先对`middleware`做类型检查，`middleware`必须是数组，同时每一个中间件必须是函数。然后返回一个函数，这个函数第一个参数是上下文对象，第二个参数是下个中间件执行的next函数。核心逻辑是上面的`dispatch`方法，在`dispatch`方法中会返回Promise。`dispatch`方法实际上就是next方法，首次会调用`dispatch(0)`来触发第一个中间件函数。当一个中间件中调用next方法后会把`index`标记为当前的索引，如果一个中间件多次调用`next`方法，那么由于第一次调用是`index`会标记为`i`，那么第二次调用的时候`i`和`index`是相等的，也就是第二次的时候会走`if (i <= index) return Promise.reject(new Error('next() called multiple times'))`逻辑，也就是会报错。每次调用的时候根据索引获取当前要执行的中间件函数，在第18行会执行当前中间件，并把下一个`dispatch`当作第二个参数`next`传入到下一个中间件中。当执行到最后一个中间件的时候，设置`fn = next`由于Application代码的第52行并没有传递第二个参数，所以此时`next`是`undefined`，那么`compose`中将会走第16行`if (!fn) return Promise.resolve()`的逻辑。如果传递了函数那么会执行传入的函数，当此函数中调用next以后，由于索引已经超过了`middleware`的长度，所以下次函数执行事也会走第16行的逻辑。

### context源码 ###

`context`是对上下文对象的封装，具体代码如下：

```JavaScript
const util = require('util')
const createError = require('http-errors')
const httpAssert = require('http-assert')
const delegate = require('delegates')
const statuses = require('statuses')
const Cookies = require('cookies')

const COOKIES = Symbol('context#cookies')

const proto = module.exports = {
  inspect () {
    if (this === proto) return this
    return this.toJSON()
  },

  toJSON () {
    return {
      request: this.request.toJSON(),
      response: this.response.toJSON(),
      app: this.app.toJSON(),
      originalUrl: this.originalUrl,
      req: '<original node req>',
      res: '<original node res>',
      socket: '<original node socket>'
    }
  },

  assert: httpAssert,

  throw (...args) {
    throw createError(...args)
  },

  onerror (err) {.
    if (err == null) return

    const isNativeError =
      Object.prototype.toString.call(err) === '[object Error]' ||
      err instanceof Error
    if (!isNativeError) err = new Error(util.format('non-error thrown: %j', err))

    let headerSent = false
    if (this.headerSent || !this.writable) {
      headerSent = err.headerSent = true
    }

    // delegate
    this.app.emit('error', err, this)

    if (headerSent) {
      return
    }

    const { res } = this

    if (typeof res.getHeaderNames === 'function') {
      res.getHeaderNames().forEach(name => res.removeHeader(name))
    } else {
      res._headers = {} // Node < 7.7
    }

    // then set those specified
    this.set(err.headers)

    // force text/plain
    this.type = 'text'

    let statusCode = err.status || err.statusCode

    // ENOENT support
    if (err.code === 'ENOENT') statusCode = 404

    // default to 500
    if (typeof statusCode !== 'number' || !statuses[statusCode]) statusCode = 500

    // respond
    const code = statuses[statusCode]
    const msg = err.expose ? err.message : code
    this.status = err.status = statusCode
    this.length = Buffer.byteLength(msg)
    res.end(msg)
  },

  get cookies () {
    if (!this[COOKIES]) {
      this[COOKIES] = new Cookies(this.req, this.res, {
        keys: this.app.keys,
        secure: this.request.secure
      })
    }
    return this[COOKIES]
  },

  set cookies (_cookies) {
    this[COOKIES] = _cookies
  }
}

/**
 * Response delegation.
 */
delegate(proto, 'response')
  .method('attachment')
  .method('redirect')
  .method('remove')
  .method('vary')
  .method('has')
  .method('set')
  .method('append')
  .method('flushHeaders')
  .access('status')
  .access('message')
  .access('body')
  .access('length')
  .access('type')
  .access('lastModified')
  .access('etag')
  .getter('headerSent')
  .getter('writable')

/**
 * Request delegation.
 */
delegate(proto, 'request')
  .method('acceptsLanguages')
  .method('acceptsEncodings')
  .method('acceptsCharsets')
  .method('accepts')
  .method('get')
  .method('is')
  .access('querystring')
  .access('idempotent')
  .access('socket')
  .access('search')
  .access('method')
  .access('query')
  .access('path')
  .access('url')
  .access('accept')
  .getter('origin')
  .getter('href')
  .getter('subdomains')
  .getter('protocol')
  .getter('host')
  .getter('hostname')
  .getter('URL')
  .getter('header')
  .getter('headers')
  .getter('secure')
  .getter('stale')
  .getter('fresh')
  .getter('ips')
  .getter('ip')
```

可见`context`实际上就是一个对象，它对`Cookie`和`onerror`做了一个封装。最后使用`delegate()`来代理`request`和`response`对象，`delegate`不了解的同学可以看下面这个示例。

```JavaScript
const delegate = require('delegates');

const obj = {
  aaa: {
    name: 'aaa',
    age: 18,
    isBoy: true,
    say() {
      console.log(`我是${this.name}，今年${this.age}`);
    }
  }
};

delegate(obj, 'aaa')
  .method('say')
  .getter('name')
  .setter('age')
  .access('isBoy')


console.log(obj.name); // 打印 aaa
obj.age = 19; // 可以设置属性
obj.say(); // 打印 我是aaa，今年19
console.log(obj.isBoy); // 打印 true
```

上面代理了`obj`对象的`aaa`属性，所以直接可以通过`obj`来访问`aaa`中代理的属性和方法，其中`method`表示代理方法，`getter`表示代理get方法，`setter`表示代理set方法，`access`表示不但代理了get同时也代理了set。[delegates](https://github.com/tj/node-delegates)的实现也不难：

```JavaScript
function Delegator(proto, target) {
  if (!(this instanceof Delegator)) return new Delegator(proto, target);
  this.proto = proto;
  this.target = target;
  this.methods = [];
  this.getters = [];
  this.setters = [];
  this.fluents = [];
}

Delegator.auto = function(proto, targetProto, targetProp){
  var delegator = Delegator(proto, targetProp);
  var properties = Object.getOwnPropertyNames(targetProto);
  for (var i = 0; i < properties.length; i++) {
    var property = properties[i];
    var descriptor = Object.getOwnPropertyDescriptor(targetProto, property);
    if (descriptor.get) {
      delegator.getter(property);
    }
    if (descriptor.set) {
      delegator.setter(property);
    }
    if (descriptor.hasOwnProperty('value')) { // could be undefined but writable
      var value = descriptor.value;
      if (value instanceof Function) {
        delegator.method(property);
      } else {
        delegator.getter(property);
      }
      if (descriptor.writable) {
        delegator.setter(property);
      }
    }
  }
};

Delegator.prototype.method = function(name){
  var proto = this.proto;
  var target = this.target;
  this.methods.push(name);

  proto[name] = function() {
    return this[target][name].apply(this[target], arguments);
  };

  return this;
};

Delegator.prototype.access = function(name){
  return this.getter(name).setter(name);
};

Delegator.prototype.getter = function(name){
  var proto = this.proto;
  var target = this.target;
  this.getters.push(name);

  proto.__defineGetter__(name, function(){
    return this[target][name];
  });

  return this;
};

Delegator.prototype.setter = function(name){
  var proto = this.proto;
  var target = this.target;
  this.setters.push(name);

  proto.__defineSetter__(name, function(val){
    return this[target][name] = val;
  });

  return this;
};

Delegator.prototype.fluent = function (name) {
  var proto = this.proto;
  var target = this.target;
  this.fluents.push(name);

  proto[name] = function(val){
    if ('undefined' != typeof val) {
      this[target][name] = val;
      return this;
    } else {
      return this[target][name];
    }
  };

  return this;
};
```

### request与response ###

`request`与`response`就是一个简单的对象，没什么好说的，比如`request`代码大致如下：

```javascript
module.exports = {
  get header () {
    return this.req.headers
  },

  set header (val) {
    this.req.headers = val
  },

  get headers () {
    return this.req.headers
  },

  set headers (val) {
    this.req.headers = val
  },

  get url () {
    return this.req.url
  },

  set url (val) {
    this.req.url = val
  },

  // 省略其他代码
}

```

这里需要注意的是有一个`this.req`对象，这个对象是从哪里来的？请看`Application`的`createContext`方法的第61行，在这里把node的`req`挂载了上来，`res`同理。
