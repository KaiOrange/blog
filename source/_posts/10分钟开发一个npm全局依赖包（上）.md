---
title: 10分钟开发一个npm全局依赖包（上）
date: 2019-09-06 19:41:44
author: Orange
tags:
  - Node
categories: Node
---

今天在逛网页的时候看到了一个[古诗词的API](https://gushi.ci/)，然后突发奇想，用了10分钟的时间做了一款npm全局依赖包。你可以使用`npm install -g pome-cli`来先玩一玩。有好东西当然要跟大家分享一下啦，现在从0开始给大家简绍打造这款全局依赖包。

----

## 创建项目 ##

首先创建一个文件夹，比如`poem-cli`（这里以`poem-cli`来讲，在你开发的时候换一个名字，因为这个名字已经被我注册了），然后进入该文件夹，命令行输入`npm init`，里面的选项根据自己的喜好来设置就可以了，默认的话回车就行。等命令行输完以后，会在该目录下自动创建一个`package.json`文件，这个文件大家一定不陌生吧。

## 代码编写 ##

由于我们的数据是走网络请求的，[axios](https://github.com/axios/axios)是一个可以在浏览器环境和Node环境同时运行的一个HTTP框架。我们这里也引入这个库来简化我们的发送请求过程，命令行输入`npm install axios`。新建一个`index.js`文件写入请求的代码，由于我们目前对API的结构不太了解，就直接打印出返回的数据就行了：

```JavaScript
const axios = require('axios');

axios.get('https://api.gushi.ci/all.json')
  .then(function (response) {
    console.log(response.data || {})
  });
```

在命令行输入`node index`来运行一下上面的代码，可以看到打印的结果如下，当然具体的内容可能有点不太一样：

![首次运行](1.png)

我们可以看到返回的数据是一个JSON对象，那么我们就好处理了，只要稍微修改一下代码，让显示的更好看一点：

```JavaScript
const axios = require('axios');

axios.get('https://api.gushi.ci/all.json')
  .then(function (response) {
    let data = response.data || {};
    console.log(data.content);
    console.log("———— " + data.author + "《" + data.origin + "》");
  });
```

此时的效果如下：

![处理后的效果](2.png)

当然我们经常看到的诗句，署名往往是右对齐的，我们这里也稍微处理一下对于没有诗句长的署名，让署名右对齐。要想右对齐其实很简单就是左边加空格填充呗：

```JavaScript
const axios = require('axios');

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
    signature = (paddingSpacing + prefix) + signature
    console.log();
    console.log(data.content);
    console.log(signature);
    console.log();
  });
```

现在代码已经很多了，代码第6行和第7行我们把署名和横线拆分成2个变量，因为一个汉字相当于2个空格而一个横线是一个字符，上面的`prefix`中其实是4个短横线和一个空格组成的。然后在代码的第9行我们计算了一下需要填充的空格数量，也就是诗句乘以2然后减去署名乘以2再减去横线（诗句和署名都是汉字或者汉字的标点符号占了2个空格），还有一种特殊情况是，有些署名中有符号的点（·），如`李商隐《无题·昨夜星辰昨夜风》`中的点，这个点占据了一个字符，我们要对这个点做特殊处理，特殊处理见第11到第13行代码，最后14行代码把空格也加上。后面打印的时候多了2个`console.log();`是为了换行，当然是用`\n`来换行也是可以的。需要说明的是我们这里使用字符串的拼接来做的，当然也可以使用ES6的模板字符串。最后看一下结果：

![对齐处理](3.png)

## 添加配置 ##

现在我们的代码基本上写的差不多了，然后试着按照全局包来处理。首先修改`package.json`文件，添加`bin`字段，`bin`字段的作用是告诉环境执行命令的时候执行哪个文件。如下：

```JSON
{
  "name": "poem-cli",
  "version": "1.0.0",
  "description": "命令行随机打印一句诗词。",
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

上述第5到7行可是重点哦，写了`bin`以后在`bin`的入口文件（也就是`index.js`文件）的最上方还要加一行代码，如下：

```JavaScript
#!/usr/bin/env node
const axios = require('axios');

// ... 其他代码同上的index.js
```

`#!/usr/bin/env node`看着和注释很像，到底有什么作用呢？其实它声明了脚本文件的解释程序，脚本文件有很多，我们要运行这个`index.js`，就得告诉系统你是要用什么来执行我们的脚本，这里当然是使用node了。

把这两个地方修改后，我们基本上可以使用了，先测试一下看可以用不。使用`npm link`命令，它的作用是把当前文件夹拷贝到node全局包的安装环境下，当拷贝过去以后你就可以把他当成一个全局包使用了，拷贝完后直接使用`poem-cli`来运行脚本就可以了。

![使用npm link](4.png)

## 发布到npm仓库上 ##

`npm link`命令是把本地的文件夹放在全局目录下，但是为了更多的小伙伴使用我们的包，就需要把该包放在npm仓库中。首先需要去[npm官网](https://www.npmjs.com/)注册自己的账号，已有账号忽略这一步。此外由于国内一般使用的是淘宝的镜像，如果你使用的也是淘宝的或者其他的镜像，这里**必须**要切回到npm的镜像，强烈建议使用nrm来管理镜像源：

```sh
# 安装nrm
npm install -g nrm
# 切回到npm镜像源
nrm use npm
```

在提交的时候，往往有些东西是不希望提交的，那么可以新建一个`.npmignore`文件，作用类似于`.gitignore`，只是这个是提交npm仓库的时候忽略的，这里我们在该文件的内容如下：

```Text
node_modules/
.idea
.vscode
.gitignore
.git
```

当这个时候你只需要登录npm并且发布就好了，如果已经登录了就可以直接发布了（可以使用命令`npm whoami`来查看自己的登录信息，再次强调**一定要切到npm镜像源**）：

```sh
# 登录npm 需要数据用户名 密码 邮箱等
npm login
# 发布
npm publish
```

发布的速度还是挺快的，当你发布完成以后就可以使用`npm install -g poem-cli`来安装全局包了，当然这个名字已经被我注册了，你需要换一个名字。最后使用`poem-cli`来运行就可以了，大功告成。此时你可以使用命令`nrm use taobao`切换到淘宝镜像了，往往淘宝镜像会在5分钟内从npm获取一下新的包，所以你切到淘宝的镜像，5分钟后也可以安装（其实一般情况下根本不到5分钟）。

十分钟的时间差不多到了，我们的全局依赖包已经做完了，是不是收获还不错，下一节我们再利用20分钟，让我们的全局安装包做的更好一点，同时也简绍命令行工具常用的2个工具库。可以点击[这里](https://www.kai666666.com/2019/09/07/10分钟开发一个npm全局依赖包（下）/#more)进入。
