---
title: vue2你该知道的一切（下）
date: 2021-06-19 17:10:21
author: Orange
tags:
  - Vue
categories: JavaScript
---

本章继续回顾Vue相关的知识，主要针对组件这块，基础部分请看[上一章](https://kai666666.com/2021/06/19/vue2你该知道的一切（上）/)。

----

## 组件基础 ##

简单的组件：

```HTML
<div id="app">
  <custom-button></custom-button>
</div>
<script>
  // 自定义组件
  const CustomButton = {
    template: '<button>Custom button</button>'
  };

  new Vue({
    el: '#app',
    components: {
      CustomButton
    }
  });
</script>
```

上面的组件需要在`components`中引入，当然也可以定义一个全局的组件：

```JavaScript
Vue.component('custom-button', {
  template: '<button>Custom button</button>'
});
```

上面组件只有一个template属性，一般的组件还有data、方法、计算属性等。这里需要注意的是组件的data需要是一个方法，并且返回一个对象，而Vue实例的data是一个对象，如果组件的data是一个对象的话，那么多个组件将会使用一份数据，这样所有组件数据都是一样的，某个组件修改数据会影响到其他的同类组件。

```JavaScript
Vue.component('positive-numbers', {
  template: '<p>{{ positiveNumbers.length }} positive numbers</p>',
  data() { // 组件中这里需要是函数
    return {
      numbers: [-5, 0, 2, -1, 1, 0.5]
    };
  },
  computed: {
    positiveNumbers() {
      return this.numbers.filter((number) => number >= 0);
    }
  }
});
```

## Props ##

组件的Props可以声明父组件要传递到子组件的数据：

```HTML
<div id="app">
  <color-preview color="red"></color-preview>
  <color-preview color="blue"></color-preview>
</div>
<script>
  Vue.component('color-preview', {
    template: '<div class="color-preview" :style="style"></div>',
    props: ['color'],
    computed: {
      style() {
        return { backgroundColor: this.color };
      }
    }
  });

  new Vue({
    el: '#app'
  });
</script>
```

props可以添加校验和默认值以及是否必须，校验失败在开发环境会报错：

```JavaScript
Vue.component('price-display', {
  props: {
    price: {
      type: Number,
      required: true,
      validator(value) {
        return value >= 0;
      }
    }，
    num: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      default: '$'
    }
  }
});
```

## 组件props的大小写 ##

模板中组件的props如果是带横线的属性，最后在组件内部将会自动转化为驼峰形式，如下

```HTML
<div id="app">
  <price-display percentage-discount="20"></price-display>
</div>
<script>
  Vue.component('price-display', {
    props: {
      percentageDiscount: Number
    }
  });

  new Vue({
    el: '#app'
  });
</script>
```

这里需要注意一点`percentage-discount="20"`它的值最后是字符串的'20'而不是数字的20，所以上面代码会报错，如果要是数字的则需要`:percentage-discount="20"`，同样的Boolean类型的也一样。

## sync操作符 ##

子组件中不建议直接修改父组件传下来的props，通常使用子组件的$emit方法来修改告诉父组件要修改值。某些情况下可以使用aync操作符来简化，赋值操作。

```HTML
<count-from-number :number.sync="numberToDisplay"/>
```

组件定义：

```JavaScript
Vue.component('count-from-number', {
  template: '<p>The number is {{ number }}</p>',
  props: {
    number: {
      type: Number,
      required: true
    }
  },
  mounted() {
    setInterval(() => {
      this.$emit('updated:number', this.number + 1);
    }, 1000);
  }
});
```

实际上sync操作符只是一个语法糖，上面使用sync操作符的代码等同于：

```HTML
<count-from-number
  :number.sync="numberToDisplay"
  @update:number="val => numberToDispaly = val"
  />
```

## 自定义组件的v-model ##

假设现在需要写一个只能输入小写字母的组件input-username，它需要支持v-model：

```HTML
<input-username
  v-model="username"
  />
```

上述代码等同于：

```HTML
<input-username
  :value="username"
  @input="value => username = value"
  />
```

所以要使得自定义组件支持`v-model`可以这样写：

```JavaScript
Vue.component('input-username', {
  template: '<input type="text" :value="value" @input="handleInput">',
  props: {
    value: {
      type: String,
      required: true
    }
  },
  methods: {
    handleInput(e) {
      const value = e.taret.value.toLowerCase();

      // If valeu was changed, update it on the input too
      if (value !== e.target.value) {
        e.target.value = value;
      }

      this.$emit('input', value);
    }
  }
});
```

## 插槽slot ##

简单使用：

```JavaScript
Vue.component('custom-button', {
  template: '<button class="custom-button"><slot></slot></button>'
});
```

上面定义了一个`custom-button`的组件，则组件中间的部分将会给到插槽的位置：

```HTML
<custom-button>Press me!</custom-button>
```

渲染后：

```HTML
<button class="custom-button">Press me!</button>
```

插槽也可以给默认内容，只要下载`slot`标签中间：

```JavaScript
Vue.component('custom-button', {
  template: `<button class="custom-button">
    <slot><span class="default-text">Default button text</span></slot>
  </button>`
});
```

这是如果自定义组件没有内容的时候将会使用默认内容，如：


```HTML
<custom-button></custom-button>
```

渲染后：

```HTML
<button class="custom-button">
  <span class="default-text">Default button text</span>
</button>
```

具名插槽就是给插槽起一个名字，如下面是`blog-post`组件的模板，其中`<slot name="header"></slot>`就是一个具名插槽，

```HTML
<section class="blog-post">
  <header>
    <slot name="header"></slot>
    <p>Post by {{ author.name }}</p>
  </header>

  <main>
    <slot></slot>
  </main>
</section>
```

使用方式也很简单：

```HTML
<blog-post :author="author">
  <h2 slot="header">Blog post title</h2>

  <p>Blog post content</p>

  <p>More blog post content</p>
</blog-post>
```

最终渲染的结果是：

```HTML
<section class="blog-post">
  <header>
    <h2>Blog post title</h2>
    <p>Post by Callum Macrae</p>
  </header>

  <main>
    <p>Blog post content</p>

    <p>More blog post content</p>
  </main>
</section>
```

作用域插槽，组件的插槽可以向外面暴露数据：

```JavaScript
Vue.component('user-data', {
  template: '<div class="user"><slot :user="user"></slot></div>',
  data: () => ({
    user: { name: 123 },
  }),
});

new Vue({
  el: '#app',
  data:{
    username:'123'
  },
  template: `<user-data v-slot:default="aaa">
      <p >User name: {{ aaa.user.name }}</p>
    </user-data>`
});
```

上面相当于给defailt作用域的值定义为aaa变量，aaa.user就能获取到插槽的user属性了。当然默认插槽的也可以简写：`v-slot="aaa"`。

## Mixin ##

mixin的简单使用：

```JavaScript
const loggingMixin = {
  created() {
    console.log('Logged from mixin');
  }
};

Vue.component('example-component', {
  mixins: [loggingMixin],
  created() {
    console.log('Logged from component');
  }
});
```

当组件被创建后先后打印：`Logged from mixin`和`Logged from component`。说白了mixin对象就是一个普通的JavaScript对象，它可以混入属性、方法、生命周期等，其中属性和方法如果组件中也有同名的则组件中的会覆盖mixin中的，但是生命周期都会执行。

## vue-loader的使用 ##

当使用vue-loader了以后就可以创建`.vue`文件了。

之前的组件书写形式是：

```JavaScript
Vue.component('display-number', {
  template: '<p>The number is {{ number }}</p>',
  props: {
    number: {
      type: Number,
      required: true
    }
  }
});
```

`.vue`文件组件的书写形式是：

```HTML
<template>
  <p>The number is {{ number }}</p>
</template>

<script>
  export default {
    props: {
      number: {
        type: Number,
        required: true
      }
    }
  };
</script>
```

代码更加之目了然了，组件的引用如下：

```HTML
<div id="app">
  <display-number :number="4"></display-number>
</div>
<script>
  import DisplayNumber from './components/display-number.vue';

  new Vue({
    el: '#app',
    components: {
      DisplayNumber
    }
  });
</script>
```

## 非prop属性 ##

vue对非prop属性的处理是放在组件的外层上，并覆盖原有的。对于class和style则会合并。

```HTML
<div id="app">
  <custom-button type="submit">Click me!</custom-button>
</div>
<script>
  const CustomButton = {
    template: '<button type="button"><slot></slot></button>'
  };

  new Vue({
    el: '#app',
    components: {
      CustomButton
    }
  });
</script>
```

最后渲染为：

```HTML
<button type="submit">Click me!</button>
```

可以使用`this.$attr`获取所有的非props属性。

## render方法 ##

上面的例子中都是使用template来定义组件的，实际上还可以写render函数来定义组件。假设有一个组件：

```JavaScript
const CustomButton = {
  data: () => ({
    counter: 0,
  }),
  template: `<div>
    <button v-on:click="counter++">Click to increase counter</button>
    <p>You've clicked the button {{ counter }}</p> times.
  </div>`
};
```

使用render定义如下：

```JavaScript
const CustomButton = {
  data: () => ({
    counter: 0,
  }),
  render(createElement) {
    return createElement(
      'div',
      [
        createElement(
        'button',
          {
            on: {
              click: () => this.counter++,
            }
          },
          'Click to increase counter'
        ),
        createElement(
          'p',
          `You've clicked the button ${this.counter} times`
        )
      ]
    );
  }
};
```

上述代码是不是很难理解？render中代码的编写通常是由JSX来生成的，项目中使用`babel-plugin-transform-vue-jsx`插件可以把JSX转换成类似于上述的函数内容。上述代码如果使用了JSX编写如下，是不是React很像？

```JavaScript
const CustomButton = {
  data: () => ({
    counter: 0,
  }),
  methods: {
    clickHandler() {
      this.counter++
    }
  },
  render() {
    return (
      <div>
        <button onClick={this.clickHandler}>Click to increase counter</button>
        <p>You've clicked the button {counter} times</p>
      </div>
    );
  }
};
```

**如果render和template同时出现，那么优先会使用render。**
