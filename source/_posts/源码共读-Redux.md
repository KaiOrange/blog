---
title: 源码共读-Redux
date: 2023-05-23 15:52:44
author: Orange
tags:
  - 源码共读
categories: 源码共读
---

Redux是优秀的状态管理库，本节我们学习一下Redux源码，由于Redux源码是TypeScript写的，为了方便学习，本节去掉一些类型定义，转化为JavaScript来展示，另外对于错误信息我们这里就先不处理了。

## 使用 ##

Redux官方示例：

```JavaScript
import { createStore } from 'redux'

function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case 'counter/incremented':
      return { value: state.value + 1 }
    case 'counter/decremented':
      return { value: state.value - 1 }
    default:
      return state
  }
}

let store = createStore(counterReducer)

store.subscribe(() => console.log(store.getState()))

store.dispatch({ type: 'counter/incremented' }) // {value: 1}
store.dispatch({ type: 'counter/incremented' }) // {value: 2}
store.dispatch({ type: 'counter/decremented' }) // {value: 1}
```

## createStore ##

`createStore`简易实现：

```JavaScript
const randomString = () =>
  Math.random().toString(36).substring(7).split('').join('.')

const ActionTypes = {
  INIT: `@@redux/INIT${/* #__PURE__ */ randomString()}`,
  REPLACE: `@@redux/REPLACE${/* #__PURE__ */ randomString()}`,
}

function createStore(reducer, preloadedState, enhancer) {

  // 如果第二个参数是函数 第三个函数没有值的时候 认为第二个参数是enhancer
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  // enhancer有值的时候 使用enhancer来构建store
  if (typeof enhancer !== 'undefined') {
    return enhancer(createStore)(
      reducer,
      preloadedState
    )
  }

  let currentReducer = reducer
  let currentState = preloadedState
  let listeners = [];

  function getState() {
    return currentState
  }

  function subscribe(listener) {
    listeners.push(listener)

    return function unsubscribe() {
      const index = listeners.indexOf(listener)
      listeners.splice(index, 1)
    }
  }

  function dispatch(action) {
    currentState = currentReducer(currentState, action)

    listeners.forEach(listener => {
      listener()
    })
    return action
  }

  function replaceReducer(nextReducer) {
    currentReducer = nextReducer
    dispatch({ type: ActionTypes.REPLACE })
  }

  dispatch({ type: ActionTypes.INIT })

  const store = {
    dispatch: dispatch,
    subscribe,
    getState,
    replaceReducer,
  }
  return store
}
```

上述是`createStore`的简单实现，调用`createStore()`函数以后返回一个`store`对象，该对象有4个方法，如下：

1：`dispatch`：分发action，通过`currentReducer(currentState, action)`来生成新的state，并触发事件。
2: `subscribe`: 监听事件，实际上就是把事件添加到事件数组中，并返回移除事件函数。
3: `getState`：获取当前的状态。
4: `replaceReducer`：替换reducer。

最新的源码与我们的实现理念大致相同，只是多了类型的校验，另外事件采用双map形式（防止dispatch中调用subscribe/unsubscribe）而不是我们简单的数组，最后在事件触发时会使用变量标记，防止在分发过程中出现不合理的操作。

## 中间件 ##

### 中间件简绍 ###

写一个redux中间件很简单，比如写一个打印日志的中间件。

```JavaScript
const logger = function(store) {
  return function(next) {
    return function(action) {
      console.log('prev state:', store.getState()) // 更新前的状态
      let result = next(action)
      console.log('next state', store.getState()) // 更新后的状态
      return result
    }
  }
}

// 箭头函数简写
const logger = store => next => action => {
  console.log('prev state:', store.getState()) // 更新前的状态
  let result = next(action)
  console.log('next state', store.getState()) // 更新后的状态
  return result
}
```

中间件是一个嵌套三层的函数，每一层都有一个参数，参数分别是`store`、`next`、`action`。上面是`redux-logger`中间件的简单实现，常用的中间件还有`redux-thunk`，核心代码如下：

```JavaScript
const thunk = ({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return action(dispatch, getState)
  }

  return next(action)
}
```

`redux-thunk`的逻辑也很简单，通过对`store`解构获取`dispatch`和`getState`函数，如果`action`是函数则调用`action`，否则调用`next(action)`进行下一个中间件。在`action`函数中可以通过`dispatch`来触发`action`，哪怕是在异步的回调中，所以`redux-thunk`通常用来处理异步操作。

### 中间件使用 ###

```JavaScript
import { createStore, applyMiddleware } from 'redux'

function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case 'counter/incremented':
      return { value: state.value + 1 }
    case 'counter/decremented':
      return { value: state.value - 1 }
    default:
      return state
  }
}

// 带有中间件的store
let store = createStore(counterReducer, applyMiddleware(thunk, logger))

store.subscribe(() => console.log(store.getState()))

store.dispatch({ type: 'counter/incremented' })
// 打印：
// prev state: { value: 0 }
// { value: 1 }
// next state { value: 1 }

store.dispatch((dispatch, getState) => { // 异步操作
  setTimeout(() => {
    dispatch({ type: 'counter/incremented' })
  }, 1000)
})
// 1秒后打印：
// prev state: { value: 1 }
// { value: 2 }
// next state { value: 2 }
```

需要注意的是`applyMiddleware`是有顺序的，它会从做左到右依次执行，next后是从右到左执行。如果上述示例修改为`applyMiddleware(logger, thunk)`会发生什么事呢？那么在调用`store.dispatch(() => {})`的时候也会打印日志，里面的`dispatch`又会打印一次。

### applyMiddleware实现 ###

由上`createStore`函数可知，当传入中间件的时候会通过`enhancer`来生成store。`enhancer`实际上就是`applyMiddleware(logger, thunk)`的结果，它是一个两层函数，第一层接受的参数是`createStore`第二次接受的参数是`reducer`和`preloadedState`，代码大致如下：

```JavaScript
function compose(...funcs) {
  if (funcs.length === 0) {
    return (arg) => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args))
  )
}

function applyMiddleware(...middlewares) {
  return createStore => (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState)
    let dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.'
      )
    }

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args)
    }
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
```

首先通过`createStore(reducer, preloadedState)`不传中间件来创建`store`，`applyMiddleware`内层函数的返回值只有`dispatch`是处理过的函数，其他的都是与`store`中的一致，也就是说中间件的作用实际上是强化`dispatch`函数。`middlewareAPI`实际上就是中间件的第一层函数的参数`store`，这里需要注意的是`dispatch`调用的时候，下面的代码已经走完了，所以里面的`dispatch`函数是加强后的`dispatch`而不是上面定义的抛出异常的函数。通过`middlewares.map(middleware => middleware(middlewareAPI))`去掉了中间件第一层函数。`compose`核心逻辑是`funcs.reduce((a, b) => (...args) => a(b(...args)))`对于函数数组返回嵌套执行的组合函数，`compose(...chain)(store.dispatch)`最后参数是`store.dispatch`，比如有两个中间件`a`和`b`，这里相当于变成`a(b(store.dispatch))`，相当于a这一层的`next`函数是`b(store.dispatch)`函数。
