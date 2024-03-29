---
title: 解决Electron安装报错问题
date: 2019-11-06 10:00:00
author: Orange
tag:
	- Electron
categories: JavaScript
---

Electron是一个优秀的跨平台桌面端应用的框架，[官网](https://electronjs.org/)给出的简绍很简单：`使用 JavaScript, HTML 和 CSS 构建跨平台的桌面应用`。好多朋友也想试试使用前端技术来做一个桌面应用，但是往往在安装的时候就直接报错了，大多数的错误是：

```Text
Error: read ECONNRESET
# 或者
Error: Electron failed to install correctly ...
```

### 解决办法 ###

解决办法也是简单的，如果你是安装失败了，那么先把`node_modules`中的`electron`删掉，然后重新开始下面的步骤。

1. 设置淘宝镜像源（推荐使用nrm，这一步是为了保证其他依赖不报错）

  ```shell
  npm install -g nrm
  nrm use taobao
  ```

2. 设置环境变量并安装

  ```shell
  # Mac系统
  ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/ npm install

  # Windows系统
  # 全局依赖cross-env为了把参数写入环境变量 当然直接修改环境变量也可以
  npm install -g cross-env
  cross-env ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron npm install
  ```

  然后稍等片刻就可以了。

### 深入研究 ###

通过上面的设置基本上就解决了Electron安装的问题，现在我们可以深入一下，看看它是怎么解决的。首先我们进入它的[源代码](https://github.com/electron/electron)，这个里面有一个npm的文件夹，这个路径下存放的就是npm上的Electron依赖。打开看看你会发现只有几个文件，没错Electron的依赖包就这么点东西。

![Electron依赖中的内容](1.png)

那么这么点东西怎么做跨平台的应用的呢？首先看一下`package.json`文件，为了方便查看，我拷贝过来一份，如下：

```shell
{
  "main": "index.js",
  "types": "electron.d.ts",
  "bin": {
    "electron": "cli.js"
  },
  "scripts": {
    "postinstall": "node install.js"
  },
  "dependencies": {
    "@electron/get": "^1.0.1",
    "@types/node": "^12.0.12",
    "extract-zip": "^1.0.3"
  },
  "engines": {
    "node": ">= 8.6"
  }
}
```

内容很少，但有2个部分很重要。一个是`script`，可以看到里面有一个`postinstall`的钩子命令，这条命令会在**下载完依赖以后执行一下**，也就说当依赖安装完后会执行`node install.js`。另外一个重要的部分就是`bin`，它指定了**运行全局依赖时的入口文件**，也就是`cli.js`文件，我们稍后再说这个。

先简单的看一下`install.js`，里面最主要的部分是调用了方法`downloadArtifact`，用来下载跟平台相关的Electron可执行文件。下载完后调用`extractFile`方法，把文件解压了，最后在`path.txt`中把执行文件的路径写进去，这个路径下是不同平台下的可执行文件的路径。

![install.js](2.png)

最后我们看一下他是从哪里下载的。首先`downloadArtifact`方法是在[@electron/get](https://github.com/electron/get)依赖里面。我们进入到`src/index`中。

![downloadArtifact方法](3.png)

此时我们可以看到url是通过`getArtifactRemoteURL`方法获取的，然后我们看一下`getArtifactRemoteURL`方法，源码在[这里](https://github.com/electron/get/blob/master/src/artifact-utils.ts)。

![getArtifactRemoteURL方法](4.png)

在`getArtifactRemoteURL`方法中，可以看到，基础路径`base`是通过`mirrorVar`函数返回的，默认情况是没有nightly的，所以默认情况下是下面这个样子的：

```JavaScript
process.env[`NPM_CONFIG_ELECTRON_MIRROR`] ||
process.env[`npm_config_electron_MIRROR`] ||
process.env[`npm_package_config_electron_mirror`] ||
process.env[`ELECTRON_MIRROR`] ||
options['mirror'] ||
defaultValue
```

而我们很少传入env的，options也没有mirror，所以通常是`defaultValue`，具体值如下：

![defaultValue](5.png)

综上，我们可以看到默认情况下安装的时候会在[github的release处](https://github.com/electron/electron/releases)下载一个平台相关的可执行文件。但是往往在国内github会很慢，所以这就导致了下载失败的问题，如果我们的env中传入`ELECTRON_MIRROR`，那就会走该值所对应的地址，通常我们使用淘宝的镜像`http://npm.taobao.org/mirrors/electron`。

同样的，在构建Windows系统的时候可能会用到依赖`windows-build-tools`，该依赖会安装一个Python，这时可以使用淘宝的镜像文件会更快一些：

``` shell
# Macos
"PYTHON_MIRROR=http://npm.taobao.org/mirrors/python" npm install --global --production windows-build-tools
# Windows
# 若全局已经安装过cross-env那么就不需要再安装了
npm install -g cross-env
cross-env PYTHON_MIRROR=http://npm.taobao.org/mirrors/python npm install --global --production windows-build-tools
```

淘宝更多的开源软件的镜像可以参考[这里](https://npm.taobao.org/mirrors)。

### 启动过程 ###

下载过程基本上我们已经明白了，现在说一下启动过程。一般启动Electron的时候调用的命令是`electron .`，而electron命令其实是调用依赖包中的[cli.js](https://github.com/electron/electron/blob/master/npm/cli.js)文件，该文件内容如下：

```JavaScript
#!/usr/bin/env node

var electron = require('./')

var proc = require('child_process')

var child = proc.spawn(electron, process.argv.slice(2), { stdio: 'inherit', windowsHide: false })
child.on('close', function (code) {
  process.exit(code)
})

const handleTerminationSignal = function (signal) {
  process.on(signal, function signalHandler () {
    if (!child.killed) {
      child.kill(signal)
    }
  })
}

handleTerminationSignal('SIGINT')
handleTerminationSignal('SIGTERM')
```

其中`var electron = require('./')`的时候是引入当前文件夹下的`index.js`文件，内容如下：

```JavaScript
var fs = require('fs')
var path = require('path')

var pathFile = path.join(__dirname, 'path.txt')

function getElectronPath () {
  if (fs.existsSync(pathFile)) {
    var executablePath = fs.readFileSync(pathFile, 'utf-8')
    if (process.env.ELECTRON_OVERRIDE_DIST_PATH) {
      return path.join(process.env.ELECTRON_OVERRIDE_DIST_PATH, executablePath)
    }
    return path.join(__dirname, 'dist', executablePath)
  } else {
    throw new Error('Electron failed to install correctly, please delete node_modules/electron and try installing again')
  }
}

module.exports = getElectronPath()
```

`index.js`文件内容很少，主要是返回了一个字符串的地址，也就是当前路径下的dist文件夹下的可执行文件的路径。还记得下载完后往`path.txt`里面写了一个可执行文件的路径吗？

我们再回到`cli.js`文件中，从代码中可以看出，里面启动了一个子进程，用子进程启动Electron的可执行文件，并且把参数传进去了。最后如果主进程中断或者出现错误，那么就把子进程杀掉。当然你也可以直接双击dist下的可执行文件，它会启动一个默认的页面。
