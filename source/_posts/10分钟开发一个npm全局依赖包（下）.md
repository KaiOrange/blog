---
title: 10分钟开发一个npm全局依赖包（下）
date: 2019-09-07 13:44:44
author: Orange
tags:
  - Node
categories: Node
---

在[上一篇](https://kai666666.com/2019/09/06/10分钟开发一个npm全局依赖包（上）/#more)中我们用了10分钟实现了一个完整的古诗词命令行工具，本章中我们主要简绍2个命令行工具开发中常用的库，整个代码大概用时20分钟。

----

## 修改命令行颜色 ##

第一个简绍的库就是['colors-cli'](https://github.com/jaywcjlove/colors-cli)，他支持修改打印出来的文字的样式。
首先安装一下这个依赖`npm install colors-cli`，新建一个文件`test-color.js`，测试一下它的代码：

```JavaScript
var color = require('colors-cli/safe')
console.log(color.red.bold('Error!'));
console.log(color.yellow.magenta_b('Warning'));
console.log(color.blue.underline('Notice'));
```

引入`color`库的时候可以使用`var color = require('colors-cli/safe')`，也可以使用`var color = require('colors-cli')`，推荐使用前者，因为前者可以支持链式调用，使用起来更方便。上面运行结果如下：

![修改颜色](1.png)

他是怎么实现的呢？其实是把文字用特殊符号包了一层，命令行对这种特殊符号会处理成样式，就比如`color.red.bold('Error!')`其实最后会返回一个字符串`'[1m[31m[31mError![0m[0m[0m'`，所以上面三行log代码和下面的结果是一样的，你可以直接用node运行一下：

```JavaScript
console.log('[1m[31m[31mError![0m[0m[0m');
console.log('[45m[33m[33mWarning[0m[0m[0m');
console.log('[4m[34m[34mNotice[0m[0m[0m');
```

## 处理用户输入 ##

在使用命令行的时候往往需要根据用户的参数给出友好的提示，[yargs](https://github.com/yargs/yargs)就是处理这种情况的一个优质的库。
有关`yargs`的具体使用可以直接看官方的文档，这里就不展开说了。现在我们做一个需求，就是根据用户传入的值，来改变诗词、作者、来源的颜色。代码大致是这样的：

```JavaScript
#!/usr/bin/env node
const axios = require('axios');
const color = require('colors-cli/safe');
let argv = require('yargs')
  .option('ps', {
    alias: 'poem-style',
    demand: false,
    default: 'blue_bt',
    describe: '诗词样式，如--ps=blue_bt',
    type: 'string'
  }).option('as', {
    alias: 'author-style',
    demand: false,
    default: 'green_bt',
    describe: '作者样式，如--as=green_bt',
    type: 'string'
  }).option('os', {
    alias: 'origin-style',
    demand: false,
    default: 'cyan',
    describe: '来源颜色，如--os=cyan',
    type: 'string'
  }).option('h', {
    alias: 'help',
    demand: false,
    boolean: true,
    describe: '帮助',
  }).option('v', {
    alias: 'version',
    demand: false,
    boolean: true,
    describe: '版本号',
  })
  .argv;

function getColorMethod(commandStr = ''){
  let command = commandStr.replace(/\,/g,'.').split(".");
  let colorMethod = color
  for (let i = 0; i < command.length; i++) {
    colorMethod = colorMethod[command[i]];
  }
  return colorMethod;
}

axios.get('https://api.gushi.ci/all.json')
  .then(function (response) {
    let data = response.data || {};
    let signature = data.author + '《' + data.origin + '》';
    let prefix =  '———— ';
    let paddingSpacing = '';
    let spacingLength = data.content.length * 2 - signature.length * 2 - prefix.length;
    if (spacingLength > 0) {
      if (data.origin.indexOf('·') !== -1) {
        spacingLength++;
      }
      paddingSpacing = new Array(spacingLength).fill(' ').join('');
    }
    signature = getColorMethod(argv.as)(data.author) + '《' + getColorMethod(argv.os)(data.origin) + '》';
    signature = (paddingSpacing + prefix) + signature
    console.log();
    console.log(getColorMethod(argv.ps)(data.content));
    console.log(signature);
    console.log();
  });
```

运行结果如下：

![支持修改颜色](2.png)

代码还是在可以控制的行数范围内，上述代码中4~34行，是`yargs`的处理，也是通用的一种写法，这里面有2个属性比较特殊一个是`help`另一个是`version`，从下面的结果我们可以看到，当输入这两个的时候都会阻止代码的执行，并直接返回相应的信息，如运行`node index -h`会返回帮助信息、`node index -v`会返回版本信息。在代码中我们可以使用`argv.ps`、`argv.as`、`argv.os`等（其实就是option函数的第一个值）来获取参数的值。`getColorMethod`运行使用英文的点或者逗号来拆分以添加多个样式。

## 代码优化 ##

上述代码中`getColorMethod`方法其实可以抽取出去，另外`color`库并不是支持输入任何参数，比如你输入`node index --as=123`就会报错，因为123并不是`color`所支持的样式，所以我们有必要对颜色相关的操作抽取成一个文件，另外检测一下`color`库是否支持这个颜色，不支持的话给出有好地提示，现在新建`color-util.js`文件。代码如下：

```JavaScript
const color = require('colors-cli/safe')

const COLOR_TITLE = ['样式','前景色','背景色','前景色（明亮）','背景色（明亮）'];
const COLOR_STYLE = ['bold', 'faint', 'italic', 'underline', 'blink', 'overline', 'inverse', 'conceal', 'strike'];
const COLOR_FOREGROUND = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
const COLOR_BACKGROUND = ['black_b', 'red_b', 'green_b', 'yellow_b', 'blue_b', 'magenta_b', 'cyan_b', 'white_b'];
const COLOR_FOREGROUND_BRIGHT = ['black_bt', 'red_bt', 'green_bt', 'yellow_bt', 'blue_bt', 'magenta_bt', 'cyan_bt', 'white_bt'];
const COLOR_BACKGROUND_BRIGHT = ['black_bbt', 'red_bbt', 'green_bbt', 'yellow_bbt', 'blue_bbt', 'magenta_bbt', 'cyan_bbt', 'white_bbt'];
const STYLE = [ COLOR_STYLE, COLOR_FOREGROUND, COLOR_BACKGROUND, COLOR_FOREGROUND_BRIGHT, COLOR_BACKGROUND_BRIGHT];

function printSupportStyle(){
  console.log('所支持的样式有：\n');
  let message = '';

  for (let i = 0; i < COLOR_TITLE.length; i++) {
    message = STYLE[i].reduce(function (pre,next){
      return pre + color[next](next) + ' '
    }, COLOR_TITLE[i] + "： ");
    console.log(message);
  }
  // 换行
  console.log();
}

function checkStyle(styleName){
  return STYLE.join(',').split(',').indexOf(styleName) !== -1;
}

function getColorMethod(commandStr = ''){
  let command = commandStr.replace(/\,/g,'.').split(".");
  let colorMethod = color
  for (let i = 0; i < command.length; i++) {
    if (checkStyle(command[i])) {
      colorMethod = colorMethod[command[i]];
    } else {
      throw new Error('\n不支持的样式：' + command[i]);
    }
  }
  return colorMethod;
}

module.exports = {
  color,
  printSupportStyle,
  checkStyle,
  getColorMethod
}
```

请求接口的地方我们也可以封装成一个方法，这样可以减少耦合，另外也可以支持模块直接引入（直接使用require引入）。新建`random-poem.js`文件，代码如下：

```JavaScript
const axios = require('axios');

module.exports = function (){
  return new Promise(function (resolve, reject) {
    axios.get('https://api.gushi.ci/all.json')
    .then(function (response) {
      resolve(response.data || {})
    }).catch(function (error){
      reject(error)
    });
  });
}
```

因为网络请求是异步的，所以需要使用回调或者`Promise`来处理，我们这里就使用`Promise`吧。此时还需要修改一下`package.json`文件，添加`main`字段，该字段是用来告诉直接模块引入的时候引入哪个文件。

```JSON
{
  "name": "poem-cli",
  "version": "1.0.0",
  "description": "命令行随机打印一句诗词。",
  "main": "random-poem.js",
  "bin": {
    "poem-cli": "index.js"
  },
  "scripts": {
    "start": "node index"
  },
  "keywords": [
    "诗词",
    "命令行",
    "有趣"
  ],
  "author": "Orange",
  "license": "ISC",
  "dependencies": {
    "axios": "^0.19.0",
    "colors-cli": "^1.0.26",
    "yargs": "^14.0.0"
  }
}
```

此时需要注意第5行代码。最后修改`index.js`文件，使用这些封装的方法：

```JavaScript
#!/usr/bin/env node
const colorUtil = require('./color-util')
const randomPoem = require('./random-poem')
let argv = require('yargs')
    .option('s', {
      alias: 'style',
      demand: false,
      boolean: true,
      describe: '显示所支持的样式',
    }).option('ps', {
        alias: 'poem-style',
        demand: false,
        default: 'blue_bt',
        describe: '诗词样式，如--ps=blue_bt',
        type: 'string'
    }).option('as', {
        alias: 'author-style',
        demand: false,
        default: 'green_bt',
        describe: '作者样式，如--as=green_bt',
        type: 'string'
    }).option('os', {
      alias: 'origin-style',
      demand: false,
      default: 'cyan',
      describe: '来源颜色，如--os=cyan',
      type: 'string'
    }).option('h', {
      alias: 'help',
      demand: false,
      boolean: true,
      describe: '帮助',
    }).option('v', {
      alias: 'version',
      demand: false,
      boolean: true,
      describe: '版本号',
    })
    .argv;

// 显示所支持的样式
if (!!argv.s) {
  colorUtil.printSupportStyle();
} else {
  randomPoem().then(function (data){
    let signature = data.author + '《' + data.origin + '》';
    let prefix =  '———— ';
    let paddingSpacing = '';
    let spacingLength = data.content.length * 2 - signature.length * 2 - prefix.length;
    if (spacingLength > 0) {
      if (data.origin.indexOf('·') !== -1) {
        spacingLength++;
      }
      paddingSpacing = new Array(spacingLength).fill(' ').join('');
    }
    try {
      // 添加颜色
      signature = colorUtil.getColorMethod(argv.as)(data.author) + '《' + colorUtil.getColorMethod(argv.os)(data.origin) + '》';
      signature = (paddingSpacing + prefix) + signature
      console.log();
      console.log(colorUtil.getColorMethod(argv.ps)(data.content));
      console.log(signature);
      console.log();
    } catch (error) {
      // 错误处理
      console.log(colorUtil.color.red(error.message));
      colorUtil.printSupportStyle();
    }
  })
}

```

测试一下输入不支持的情况，你会发现提示的信息已经很友好了：

![完整版](3.png)

最后把多余的`test-color.js`文件删除了就可以提交了。

就这样我们把一个功能完善的古诗词命令行工具做完了，需要注意一点再次提交的时候，也就是运行`npm publish`前，需要修改一下`package.json`中的`version`字段，而且必须大于当前的版本号，建议使用`npm version 1.0.1`这样的命令去修改，因为该命令会顺带把`package-lock.json`文件中的版本号也改了。
