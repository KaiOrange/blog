---
title: 请你挑战一下这几道nextTick面试题
date: 2021-07-30 10:54:24
author: Orange
tags:
  - Vue
categories: JavaScript
---

Vue大家再熟悉不过了，Vue的`this.$nextTick`大家也再熟悉不过了，今天我们就来看看自创的`nextTick`相关的几道面试题，看看你是否真正理解Vue的`nextTick`。

----

### 题目1 ###

```HTML
<template>
  <div>
    <div ref="text">{{ text }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: 0
    }
  },
  mounted() {
    this.$nextTick(() => {
      // 下面语句输出什么？
      console.log(this.$refs.text.textContent)
    })
    this.text = 1
    this.text = 2
    this.text = 3
  }
}
</script>
```

给你3秒，请你仔细考虑一下这道题输入什么？3、2、1...OK，你的答案是`3`吗？如果是的话，那么恭喜你，答错了！正确答案是`0`。什么？`this.$nextTick`不是等DOM处理完后才执行吗，这里怎么不适用了？等等我们再来一题，至于为什么最后再讨论。

### 题目2 ###

```HTML
<template>
  <div>
    <div ref="text">{{ text }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: 0
    }
  },
  mounted() {
    this.text = 4
    this.$nextTick(() => {
      // 下面语句输出什么？
      console.log(this.$refs.text.textContent)
    })
    this.text = 1
    this.text = 2
    this.text = 3
  }
}
</script>
```

题目2和题目1就多了一行`this.text = 4`，这个打印的是多少呢？再给你3秒，3、2、1...OK，正确答案是`3`，跟你的答案一样吗？如果一样那么恭喜你了，我们再来一道过过瘾。

### 题目3 ###

```HTML
<template>
  <div>
    <div ref="text">{{ text }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: 0
    }
  },
  mounted() {
    this.text = 0
    this.$nextTick(() => {
      // 下面语句输出什么？
      console.log(this.$refs.text.textContent)
    })
    this.text = 1
    this.text = 2
    this.text = 3
  }
}
</script>
```

题目3和题目2唯一的区别是把`this.text = 4`替换成了`this.text = 0`，你的答案是多少呢？3、2、1...OK，正确答案是`0`！此刻你的内心：**"啊...这！！！"**。别急，还有呢！！

### 题目4 ###

```HTML
<template>
  <div>
    <div ref="text">{{ text }}</div>
    <div>{{ text1 }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: 0,
      text1: 0
    }
  },
  mounted() {
    this.text1 = 1
    this.$nextTick(() => {
      // 下面语句输出什么？
      console.log(this.$refs.text.textContent)
    })
    this.text = 1
    this.text = 2
    this.text = 3
  }
}
</script>
```

本题增加了一个text1变量，并且修改了text1的值，这次打印的是多少呢？3、2、1...OK，正确答案是`3`！

### 题目5 ###

```HTML
<template>
  <div>
    <div ref="text">{{ text }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: 0,
      text1: 0
    }
  },
  mounted() {
    this.text1 = 1
    this.$nextTick(() => {
      // 下面语句输出什么？
      console.log(this.$refs.text.textContent)
    })
    this.text = 1
    this.text = 2
    this.text = 3
  }
}
</script>
```

题目5比题目4模板中少了一行，你再想想这次打印的是多少？3、2、1...OK，正确答案是`0`！

好了，我们这里总共5道题，答对3道算及格，你及格了吗？接下来我们分析一下。

### 源码分析 ###

这节我们会粘贴大量Vue源码，大家只要看关键的代码就可以了，觉得看源码枯燥难懂的同学可以直接看本节最后的总结。

像如`this.text = 1`来设置值的时候，Vue会帮助我们异步的去更新视图，这里涉及Vue响应式原理，最终会调用`nextTick`来更新视图，本题中主要考察的是`nextTick`先后的顺序。哪怕你没看过Vue的源码也肯定知道Vue响应式原理是通过`Object.defineProperty`这个API来实现的吧，他是怎么做的呢？源码如下：

```Typescript
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
      dep.notify()
    }
  })
}
```

这里的代码有点长，但是你不要怕，你只要看29行和57行就行了，在第29行说明当调用get的时候会调用`dep.depend()`，在第57行的说明当调用set的时候会调用`dep.notify()`。

那么dep的`depend()`和`notify()`又做了什么呢？

```Typescript
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null
```

这里的`Dep.target`和`sub`都是`Watcher`对象的实例。这里我们先捋一捋，当我们调用属性的set的时候，会调用`dep.notify()`而该函数又调用了`subs[i].update()`也就是`Watcher`对象的`update()`方法，那么`Watcher`的`update`和上面给到的`addDep`方法又做了什么呢？

```Typescript
addDep (dep: Dep) {
  const id = dep.id
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id)
    this.newDeps.push(dep)
    if (!this.depIds.has(id)) {
      dep.addSub(this)
    }
  }
}

update () {
  if (this.lazy) {
    this.dirty = true
  } else if (this.sync) {
    this.run()
  } else {
    queueWatcher(this)
  }
}
```

`addDep`方法中可以看到当`Watcher`对象调用`addDep`的时候，实际上是传入的`Dep`对象把自己当做sub添加进去，这样在`Dep`对象调用`notify`才能通知到对应的Watcher，也就是说**组件的data在调用set前一定要调用get才会通知对应的Watcher来更新视图，实际上只要模板中用到了变量就会调用变量的get**。

`update`方法中我们看到有一个`queueWatcher(this)`的方法，这个又是搞什么呢？

```Typescript
export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    if (!flushing) {
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      let i = queue.length - 1
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    if (!waiting) {
      waiting = true

      if (process.env.NODE_ENV !== 'production' && !config.async) {
        flushSchedulerQueue()
        return
      }
      nextTick(flushSchedulerQueue)
    }
  }
}
```

`queueWatcher`我们可以看到如果`has[id] == null`就把`has[id]`设置为true，然后把`watcher`插入到队列中。由于一个组件对应一个Watcher（当然计算属性也会对应Watcher，这里说的是组件级别的Watcher），当一个属性改变后就会调用`has[id] = true`，这样当再把当前组件的属性改了以后，由于`has[id]`已经是true了，就没必要再加入到队列中了，毕竟更新视图，一次性直接全改了。最后你看到最重要的一行代码，就是`nextTick(flushSchedulerQueue)`，我们终于看到`nextTick`的影子了。调用`nextTick`的时候会把传入的函数push进回调队列里面，也就是这里把`flushSchedulerQueue`放在队列的尾部了，这个函数又做了什么呢？

```Typescript
function flushSchedulerQueue () {
  currentFlushTimestamp = getNow()
  flushing = true
  let watcher, id

  queue.sort((a, b) => a.id - b.id)

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
      watcher.before()
    }
    id = watcher.id
    has[id] = null
    watcher.run()
    // 省略部分代码...
  }

  // 省略部分代码...
}
```

可以看到`flushSchedulerQueue`先给queue进行了排序，queue中存放的就是watcher，如果有`watcher.before`的话则调用一下，处理完后把`has[id]`置为null，最关键的一行是调用了`watcher.run()`，我们再看看`watcher.run()`做了什么。

```Typescript
run () {
  if (this.active) {
    const value = this.get()
    if (
      value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // set new value
      const oldValue = this.value
      this.value = value
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue)
        } catch (e) {
          handleError(e, this.vm, `callback for watcher "${this.expression}"`)
        }
      } else {
        this.cb.call(this.vm, value, oldValue)
      }
    }
  }
}
```

`run`方法貌似就设置了一下value的值，另外执行了一个`this.cb.call(this.vm, value, oldValue)`方法，这个cb是Watcher构造函数的第三个参数，通常情况下是一个空函数。这里最重要的是`const value = this.get()`这行代码，这里调用了一下Watcher的get方法，这个get方法是什么呢？

```Typescript
get () {
  pushTarget(this)
  let value
  const vm = this.vm
  try {
    value = this.getter.call(vm, vm)
  } catch (e) {
    if (this.user) {
      handleError(e, vm, `getter for watcher "${this.expression}"`)
    } else {
      throw e
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value)
    }
    popTarget()
    this.cleanupDeps()
  }
  return value
}
```

这里需要注意的是get方法开始的时候调用`pushTarget`，结束的时候调用`popTarget`，**那么在这两段中间的代码调用`Dep.target`时指向的就是当前的Watcher对象**。另外get方法中有一个`this.getter`，这个的值如下根据Watcher第二个参数`expOrFn`来定的，我们可以在Watcher的构造方法中看到`getter`的取值逻辑：

```Typescript
class Watcher {
  // 部分代码省略
  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    this.vm = vm
    if (isRenderWatcher) {
      vm._watcher = this
    }
    vm._watchers.push(this)
    // options
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
      this.before = options.before
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    this.dirty = this.lazy // for lazy watchers
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = noop
      }
    }
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  // 部分代码省略
}
```

如果第二个参数`expOrFn`是函数的话`this.getter`就是它，如果是`a.b.c`这种字符串的话则进行解析，否则给个空函数。那么这第二个参数`expOrFn`又是什么呢，请看下面：

```Typescript
function mountComponent (
  vm,
  el,
  hydrating
) {
  vm.$el = el;
  // 省略部分代码...
  callHook(vm, 'beforeMount');

  var updateComponent;

  // 省略部分代码...

  updateComponent = function () {
    vm._update(vm._render(), hydrating);
  };

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  new Watcher(vm, updateComponent, noop, {
    before: function before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate');
      }
    }
  }, true /* isRenderWatcher */);
  hydrating = false;

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, 'mounted');
  }
  return vm
}
```

`mountComponent`代码写的是非常漂亮！首先调用了`beforeMount`生命周期方法，然后初始化`Watcher`，最后调用`mounted`生命周期方法。我们注意看`Watcher`的第二个参数`updateComponent`，该函数的实现是`vm._update(vm._render(), hydrating);`也就是说`Watcher`调用get方法的时候实际上是去更新视图了。这里你需要注意一点，`Watcher`的constructor中最后会调用`this.get()`而这时最终也会调用`updateComponent`方法，这也就是在`beforeMount`和`mounted`之间会把视图更新在DOM上的代码。

总结：

> 1. Vue会在beforeMount和mounted生命周期之间创建`Watcher`，并更新视图，当组件的`Watcher`对象调用run方法的时候，最终会调用`vm._update(vm._render(), hydrating);`来更新视图；
> 2. 当数据改变的时候，会调用`Object.defineProperty`中的set，这时除了赋值以外，还会调用`dep.notify()`来通知已收集依赖的`Watcher`调用`update`方法进行更新；
> 3. `Watcher`调用`update`方法进行更新时，会调用`queueWatcher(this)`把当前的`Watcher`对象加入到队列中，同时执行`nextTick(flushSchedulerQueue)`；
> 4. 当下一个tick执行的时候会调用`flushSchedulerQueue`方法，该方法会调用`watcher.run()`方法，进而调用`watcher.get()`用来更新视图；
> 5. 只有先调用get收集了依赖的data，在set时才可能会引起视图的更新。

### 回到本题 ###

通过源码分析我们对Vue修改视图的逻辑有了更深的认识，现在我们再回过头来看看前面的题。

题目1：由于先调用的`this.$nextTick`后修改的数据，这样数据后引起视图更改的`nextTick`会在`this.$nextTick`之后，所以打印未修改前的值，所以是`0`。
题目2：由于先修改的数据后调用的`this.$nextTick`，这样数据后引起视图更改的`nextTick`会在`this.$nextTick`之前，由于`nextTick`是异步的，当`nextTick`执行的时候，值已经是最后一次修改的值了，所以是`3`。
题目3：虽然首先调用的赋值，但是值并没有改变，在`Object.defineProperty`的`set`方法中可以看到，如果值相同直接`return`了，所以本题和题目1其实是一样的，也是`0`。
题目4：修改text1的时候也会使用`nextTick`来更新视图，而`this.$nextTick`中的函数排在更新完视图后执行，所以结果是更新后的值，也就是`3`。
题目5：在模板中把text1部分去掉了，那么text1相当于就没有调用get了，这样就不会再调用`dep.depend()`来收集依赖了，所以text1修改并不会引起`nextTick`去更新视图，所以此题的情况跟题目1也是一样的了结果是`0`。

### 题目6 ###

通过本章的学习，估计你已经收获满满，现在来一道最难的题：

```HTML
<template>
  <div>
    <div ref="text">{{ text }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: 0,
      text1: 0
    }
  },
  mounted() {
    console.info(this.text1)

    this.text1 = 1
    this.$nextTick(() => {
      // 下面语句输出什么？
      console.log(this.$refs.text.textContent)
    })
    this.text = 1
    this.text = 2
    this.text = 3
  }
}
</script>
```

这题是题目5的变种，在设置前通过`console.info(this.text1)`打印了一下text1的值，那么就会调用`get`方法，那么问题来了，此时结果是什么？3、2、1...OK，什么！你说`3`？哈哈，当然不对，这里还是`0`，为什么呢？这里虽然调用`get`方法了，但是`Dep.target`是`undefined`，所以也没有收集到依赖，毕竟在get方法中只有`Dep.target`不为空才去调用`dep.depend()`。那么为什么`Dep.target`是`undefined`的呢？之前说过`Watcher`的`get`方法开始的时候调用`pushTarget`，结束的时候调用`popTarget`，而这个时候打印的时早就`popTarget`了，所以`Dep.target`是`undefined`。那么为什么写在模板里面就有了呢？实际上在`mountComponent`方法中创建`Watcher`时，构造方法最下面会调用`Watcher`的`get`方法，`get`方法不是先会调用一下`pushTarget`吗？此时的`Dep.target`指向的是当前的`Watcher`对象，这个时候`this.getter.call(vm, vm)`实际调用的是`vm._update(vm._render(), hydrating);`，而`vm._render`就会处理模板中的变量，那么模板中变量的`get`也就会被调用了，**所以放在模板中的变量在会被收集依赖**。
