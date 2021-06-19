---
title: vue2你该知道的一切（上）
date: 2021-06-19 09:53:19
author: Orange
tags:
  - Vue
categories: JavaScript
---

Vue知识点众多，这[两章](https://kai666666.com/2021/06/19/vue2%E4%BD%A0%E8%AF%A5%E7%9F%A5%E9%81%93%E7%9A%84%E4%B8%80%E5%88%87%EF%BC%88%E4%B8%8B%EF%BC%89/#more)记录一下Vue2.x版本的常规使用方法。如果你是一名使用Vue框架开发的前端工程师，那么这两章的内容会让你对Vue的知识点记得更牢固。

----

## 如何引入 ##

HTML只要引入Vue就可以直接使用了，这里可以使用CDN地址[https://unpkg.com/vue](https://unpkg.com/vue)来引入Vue：

```HTML
<div id="app"></div>

<script src="https://unpkg.com/vue"></script>
<script>
  new Vue({
    el: '#app',
    created() {
      // This code will run on startup
    }
  });
</script>
```

除了HTML直接引入Vue以外，也可以使用vue-loader与webpack配合，来使用`.vue`文件来编写代码，webpack中配置vue-loader如下（只截取vue-loader配置部分）：

```JavaScript
module: {
  rules: [
    {
      test: /\.vue$/,
      loader: 'vue-loader',
    },
    // ...其他loader
  ]
}
```

当然最简单的还是使用vue-cli来初始化一个项目：

```shell
npm install -g vue-cli
vue init webpack
```

## 基本使用 ##

**data中的数据可以使用双花括号引入，也可以用在`v-`开头的指令中**，如下：

```HTML
<div id="app">
  <p v-if="path === '/'">你在主页</p>
  <p v-else>你当前的地址是：{{ path }}</p>
</div>
<script>
  new Vue({
    el: '#app',
    data: {
      path: location.pathname
    }
  });
</script>
```

## v-if与v-show的使用 ##

```HTML
<div v-if="true">v-if true</div>
<div v-if="false">v-if false</div>
<div v-show="true">v-show true</div>
<div v-show="false">v-show false</div>
```

最终输出的是HTML如下：

```HTML
<div>v-if true</div>
<!---->
<div>v-show true</div>
<div style="display: none;">v-show false</div>
```

**可见，v-show是使用`display`来控制是否显示的，而v-if则直接控制是有有该元素。**

v-if多条件判断：

```HTML
<div v-if="state === 'loading'">加载中..。</div>
<div v-else-if="state === 'error'">出错了</div>
<div v-else>其他内容</div>
```

## v-for的使用 ##

**v-for是循环指令，可以用在数组，对象和数字上。**

数组循环：

```HTML
<div id="app">
  <ul>
    <li v-for="(item, index) in dogs" :key="index">{{ 1 + index + ':' + item }}</li>
  </ul>
</div>
<script>
  new Vue({
    el: '#app',
    data: {
      dogs: ['Rex', 'Rover', 'Henrietta', 'Alan']
    }
  });
</script>
```

对象循环：

```HTML
<div id="app">
  <ul>
    <li v-for="(value, key) in obj" :key="key">{{ key + ':' + value }}</li>
  </ul>
</div>
<script>
  new Vue({
    el: '#app',
    data: {
      obj: {
        a: 1,
        b: 2,
        c: 3,
      }
    }
  });
</script>
```

数字循环，这里打印1~10，**注意v-for用在数字上，索引会从1开始而不是0**：

```HTML
<div id="app">
  <ul>
    <li v-for="num in 10" :key="num">{{ num }}</li>
  </ul>
</div>
<script>
  new Vue({
    el: '#app',
    data: {
    }
  });
</script>
```

## 属性绑定 ##

属性绑定使用`v-bind:`，或者简写形式`:`冒号

```HTML
<div id="app">
  <button v-bind:type="buttonType">Test button</button>
  <button :type="buttonType">Test button</button>
</div>
<script>
  new Vue({
    el: '#app',
    data: {
      buttonType: 'submit'
    }
  });
</script>
```

由于Vue是使用Object.defineProperty来做的响应式的，所以对于**给对象添加新的属性、使用数组下标修改数组值、修改数组长度来删除数组元素**这三种操作是无法做到响应式，所以Vue提供了set和delete方法：

```JavaScript
Vue.set(data, 'key', value);
// 组件内可以
this.$set(data, 'key', value);

Vue.delete( data, index);
// 组件内可以
this.$delete( data, index);
```

## v-html ##

如果需要把一段字符串当做HTML元素来使用的时候可以使用v-html，否则HTML标签会被转移。需要注意的是v-html的内容一点要保证是安全的，否则容易受到XSS攻击。

```HTML
<div v-html="yourHtml"></div>
```

## v-modal双向绑定 ##

```HTML
<div id="app">
  <input type="text" v-model="inputText">
  <p>inputText: {{ inputText }}</p>
</div>
```

## 方法 ##

```HTML
<div id="app">
  <ul>
    <li v-for="number in filterPositive(numbers)">{{ number }}</li>
  </ul>
</div>
<script>
  new Vue({
    el: '#app',
    data: {
      numbers: [-5, 0, 2, -1, 1, 0.5]
    },
    methods: {
      filterPositive(numbers) {
        return numbers.filter((number) => number >= 0);
      }
    }
  });
</script>
```

## 计算属性 ##

```HTML
<div id="app">
  <p>Sum of numbers: {{ numberTotal }}</p>
</div>
<script>
  new Vue({
    el: '#app',
    data: {
      numbers: [5, 8, 3]
    },
    computed: {
      numberTotal() {
        return numbers.reduce((sum, val) => sum + val);
      }
    }
  });
</script>
```

**计算属性与方法的区别**：计算属性会被缓存，如果在模板中多次调用一个方法，方法中的代码在每一次调用时都会执行一遍，但是如果计算属性被多次调用，其中的代码会执行一次，之后每次调用都会使用被缓存的值。**只有当计算属性的依赖发生变化时，代码才会被再次执行。**此外方法可以携带参数，但是计算属性可以设置值，如下：

```HTML
<div id="app">
  <p>Sum of numbers: {{ numberTotal }}</p>
</div>
<script>
  new Vue({
    el: '#app",
    data: {
      numbers: [5, 8, 3]
    },
    computed: {
      numberTotal: {
        get() {
          return numbers.reduce((sum, val) => sum + val);
        },
        set(newValue) {
          const oldValue = this.numberTotal;
          const difference = newValue - oldValue;
          this.numbers.push(difference)
        }
      }
    }
  });
</script>
```

## watch的使用 ##

```JavaScript
new Vue({
  el: '#app',
  data: {
    count: 0
  },
  watchers: {
    count(newValue, oldValue) {
      // this.count has been changed!
      console.log('新的值：' + newValue)
      console.log('旧的值：' + oldValue)
    }
  }
});
```

注意：在watch中一定不要去修改当前监听的值，否则容易造成死循环。如上面count方法中不要写`this.count = XXX`。

watch也可以监听对象的某个属性：

```JavaScript
new Vue({
  data: {
    formData: {
      username: ''
    }
  },
  watch: {
    'formData.username'(newValue, oldValue) {
      // this.formData.username has changed
    }
  }
});
```

当然也可以使用函数来监听：

```JavaScript
this.$watch('formData.username', function (newValue, oldValue) {

})
```

对于watch监听对象的情况如果对象的引用不变，则不会调用监听的方法，如上面formData.username改变如果只监听formData则不会调用，如果这种情况需要调用的时候，可以传递deep参数：

```JavaScript
new Vue({
  data: {
    formData: {
      username: ''
    }
  },
  watch: {
    formData: {
      handler(newValue, oldValue) {
        // formData.username改变也会调用
      },
      deep: true
    }
  }
});
```

## filter的使用 ##

```HTML
<div id="app">
  <p>Product one cost: {{ productOneCost | formatCost('$') }}</p>
</div>
<script>
  new Vue({
    el: '#app',
    data: {
      productOneCost: 998,
    },
    filters: {
      formatCost(value, symbol = '￥') {
        return symbol + (value / 100).toFixed(2);
      }
    }
  });
</script>
```

上述最后渲染出的是`Product one cost: $9.98`，filter也可以不传参数，如下

```HTML
<p>Product one cost: {{ productOneCost | formatCost }}</p>
```

上述渲染出的是`Product one cost: ￥9.98`

除此之外还可以定义全局的过滤器：

```JavaScript
Vue.filter('formatCost', function (value, symbol = '￥') {
  return symbol + (value / 100).toFixed(2);
})
```

## 使用ref访问元素或者组件 ##

```HTML
<canvas ref="myCanvas"/>

<!-- JS中使用如下访问 -->
<!-- this.$refs.myCanvas -->
```

## 事件 ##

最简单的使用：

```HTML
<button v-on:click="counter++">Click to increase counter</button>
<p>You've clicked the button {{ counter }}</P> times.
```

使用方法：

```HTML
<div id="app">
  <button v-on:click="increase">Click to increase counter</button>
  <p>You've clicked the button {{ counter }}</p> times.
</div>

<script>
  new Vue({
    el: '#app',
    data: {
      counter: 0
    },
    methods: {
      increase(e) {
        this.counter++;
      }
    }
  });
</script>
```

v-on:可以使用@来代替简写：

```HTML
<button @click="increase">Click to increase counter</button>
```

修饰符：

```HTML
<button @click.stop.prevent="increase">Click to increase counter</button>
<input @keyup.enter="submit">
```

Vue的修饰符有很多，不同修饰符间可以连用，修饰符的顺序不同左右可能也会不同。这里简单的列举一下常用的修饰符：

常用修饰符|说明
---|---
.stop|阻止事件冒泡
.prevent|阻止默认行为
.capture|捕获模式
.self|只监听元素自身而不监听子元素
.once|只调用一次方法
.passive|提前告知不阻止默认行为（可以提高移动端性能），不可与.prevent一起使用，如果同时存在则忽略.prevent
.exact|准确地触发，如`@click.ctrl.exact`则只有当ctrl按下并且点击的时候才触发；再如`@click.exact`则只有点击切不能按任何其他键才触发
.ctrl|ctrl按下时
.alt|alt按下时
.shift|shift按下时
.meta|Command或者Windows键被按下时

鼠标按钮修饰符：

修饰符|说明
---|---
.left|鼠标左键，如`@mousedown.left`表示鼠标左键被按下
.right|鼠标右键
.middle|鼠标滚轮

对于keyup等按键事件来说，提供了专门的按键修饰符，如：`.enter`、`.tab`、`.delete`(捕获“删除”和“退格”键)、`.esc`、`.space`、`.up`、`.down`、`.left`、`.right`和`.数字`(数字对应的是keyCode)

也可以自定义键名，如`v-on:keyup.f1`

```JavaScript
Vue.config.keyCodes.f1 = 112
```

## 生命周期钩子函数 ##

```JavaScript
new Vue({
  beforeCreate() { // 实例初始化前被触发
  },
  created() {// 初始化后被添加到DOM之前触发
  },
  beforeMount() {// 已经准备好添加DOM前触发
  },
  mounted() {// 元素创建后触发（不一定添加到DOM中了，需要使用nextTick来保证添加进去了）
  },
  beforeUpdate() {// 数据更新后将对dom做一些更改时触发
  },
  updated() {// DOM更新后触发
  },
  deforeDestroy() {// 即将销毁时触发
  },
  destroyed() {// 销毁后触发
  }
})
```

## 自定义指令 ##

```HTML
<p v-blink>This content will blink</p>

<script>
Vue.directive('blink', {
  bind(el, binding, vnode, oldVno) {
    let isVisible = true;
    el.dataset.blinkTimer = setInterval(() => {
      isVisible = !isVisible;
      el.style.visibility = isVisible ? 'visible' : 'hidden';
    }, binding.value || 1000);
  },
  unbind(el) {
    if(el.dataset.blinkTimer) {
      clearInterval(el.dataset.blinkTimer);
      delete el.dataset.blinkTimer
    }
  }
});
</script>
```

指令有5个钩子函数：bind、inserted、update、componentUpdated、unbind。
update指的是当前组件被更新时调用，此时可能子组件还没有更新。componentUpdated是所有子组件都更新后调用。

定义指令还有一种简写的形式：

```JavaScript
Vue.directive('my-directive', (el) => {
  // 这里的回调将会在bind和update的时候调用
});

```

钩子函数的参数有el、binding、vnode 和 oldVnod。其中binding又是一个对象，它的属性有：name、value、oldValue（仅在 update 和 componentUpdated钩子中可用）、expression、arg、modifiers。

## transition动画 ##

```HTML
<transition name="fade">
  <div v-if="divVisible">This content is sometimes hidden</div>
</transition>

<style>
.fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}
</style>
```

过渡类名：{name}-enter、{name}-enter-active、{name}-enter-to、{name}-leave、{name}-leave-active、{name}-leave-to。

过渡也可以使用JS的钩子函数来做：

```HTML
<transition
    v-on:before-enter="handleBeforeEnter"
    v-on:enter="handleEnterp"
    v-on:leave="handleLeave">
  <div v-if="divVisible">...</div>
</transition>

<script>
new Vue({
  el: '#app',
  data: {
    divVisible: false
  },
  methods: {
    handleBeforeEnter(el) {
      el.style.opacity = 0;
    },
    handleEnter(el, done) {
      TweenLite.to(el, 0.6, { opacity: 1, onComplete: done });
    },
    handleLeave(el, done) {
      TweenLite.to(el, 0.6, { opacity: 0, onComplete: done });
    }
  }
});
</script>
```

## 绑定Class ##

静态使用class：

```HTML
<div class="foo bar">
  <!-- ... -->
</div>
```

可以使用数组：

```HTML
<div :class="['foo', 'bar']">
  <!-- ... -->
</div>
```

也可以使用对象，如果值为true的时候则使用该类：

```HTML
<div :class="{foo: false, bar: true}">
  <!-- ... -->
</div>
```

还可以混着使用数组和对象：

```HTML
<div :class="['class1', {foo: false, bar: true}]">
  <!-- ... -->
</div>
```

还可以写一个静态的和一个动态的class，最终的结果是两者的合并：

```HTML
<div class="class1" :class="{foo: false, bar: true}">
  <!-- ... -->
</div>
```

## 绑定style ##

style的绑定和class有些类似，需要注意的是对于`font-weight`这种带有连字符的属性需要使用驼峰形式，如`fontWeight`。

对象形式：

```HTML
<div :style="{ fontWeight: 'bold', color: 'red' }"></div>
```

数组形式，可以串联多个对象：

```HTML
<div :style="[{fontWeight: 'bold'}, {color: 'red'}]">...</div>
```

一般情况下，Vue会自动加上浏览器的前缀的，当然也可以自己设置多重置：

```HTML
<div :style="{ display: ['-webkit-box', '-ms-flexbox', 'flex'] }">...</div>
```

## vue-loader的Scoped CSS ##

在.vue文件中样式默认是全局的，如果在style标签中加入scoped则只会应用在本组件内：

```HTML
<template>
  <p>The number is <span class="number">123</span></p>
</template>

<script>
  export default {
  };
</script>

<style scoped>
  .number {
    font-weight: bold;
  }
</style>
```

为什么会只改变本组件呢？实际上当写有scoped后，打包出来的组件元素都将会有一个data-v-{hash}的属性，而样式也会加上该属性，如下(hash可能是其他的值)：

```HTML
<p data-v-e0e8ddca>The number is <span data-v-e0e8ddca class="number">123</span></p>

<style>
.number[data-v-e0e8ddca] {
  font-weight: bold;
}
</style>
```

## vue-loader的CSS Modules ##

style标签中使用module属性，表示使用了CSS Modules，如下：

```HTML
<template>
  <p>The number is <span :class="$style.number">{{ number }}</span></p>
</template>

<style module>
  .number {
    font-weight: bold;
  }
</style>

```

## 使用SCSS ##

首先需要安装SCSS，使用命令：

```Shell
npm install --save-dev sass-loader node-sass
```

然后在style上使用`lang="scss"`属性就可以了：

```HTML
<style lang="scss" scoped>
  $color: red;

  .number {
    font-weight: bold;
    color: $color;
  }
</style>
```
