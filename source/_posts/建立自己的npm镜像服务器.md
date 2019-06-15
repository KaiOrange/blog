---
title: 建立自己的npm镜像服务器
date: 2019-06-15 10:00:00
author: Orange
tag:
	- npm镜像
	- npm源
categories: node
---

好多公司有这样的需求，需要把公司内部的依赖包放在npm服务器上这样安装的时候直接使用`npm install`安装了。同时，公司可能不希望自己的代码被别人看到，那么建立自己的npm镜像服务器是最好的选择。最近我也遇到同样的问题，希望在自己公司内部搭建一个npm镜像服务器。

搭建这个服务器有两种办法，一种是使用cnpm来做，优点是功能强大；还有一种解决办法就是使用[sinopia](https://github.com/rlidwka/sinopia)。

cnpm方式是最常用的，网上有好多简绍，这里就不重复了，感兴趣的可以看[这篇](https://juejin.im/post/5a386b0d6fb9a0450f220c59)，我们这里讲的是第二种方法。为什么使用第二种方式呢，因为这种方式实在是太简单了（开箱即用），对于一般的小公司来说这种方式非常合适。

----

## 部署 ##

1. 下载全局依赖

```shell
npm install -g sinopia
```

2. 启动

```shell
sinopia
```

好了吗？没错好了！这个时候你已经可以访问了。当你启动以后不出意外的话，最后两行日志大概是这个样子的：

![《最后2行日志》](1.png)

这两行是比较重要的，其中第一行是sinopia的配置文件路径，第二行是镜像源的URL，通常我们需要开放到整个内网中，那么我们不太希望使用`localhost`去访问，更多情况下希望使用IP或者域名去访问，这个时候就得修改配置了。

## 修改配置 ##

打开配置文件`/Users/admin/.config/sinopia/config.yaml`（具体文件路径，可以参考上面第一行日志），然后在最下面添加一行：`listen: 0.0.0.0:4873`。

另外我们的国内的镜像源一般是使用淘宝镜像去下载东西的，那么可以把我们的镜像源的来源设置为淘宝的镜像源，这样可以提高国内的下载速度。做法也是修改这个配置文件，找到`uplinks`下面两行把url替换一下，具体的如下：

```yaml
# a list of other known repositories we can talk to
uplinks:
  npmjs:
    url: https://registry.npm.taobao.org/
```

配置好后就大功告成了，把配置文件保存一下，然后重启`sinopia`（命令行中`Ctrl + C`，然后重新运行`sinopia`命令）。

此时可以在浏览器键入`http://你的IP:4873/`或者`http://localhost:4873/`来访问管理页面。

## 切换到我们的镜像源 ##

切换镜像源很简单，只要一行代码就搞定：

```shell
npm config set registry http://你的IP:4873/
```

当然为了更好的对镜像源管理我建议使用`nrm`来切换：

```shell
npm install -g nrm
nrm add sinopia http://你的IP:4873/
nrm use sinopia
```

这里我把我们的镜像源命名为`sinopia`，你也可以定义为你喜欢的名字，你可以使用`nrm ls`查看所有镜像源，还可以使用`nrm use XXX`换成镜像源列表中的其他镜像源。

## 上传一个依赖包 ##

说了这么多我们现在可以开发一个自己的包，然后上传到我们的镜像源上。
首先切换到我们自己的源上，然后添加用户（我们镜像源上的用户不是npm镜像源中的用户）。添加用户使用下面命令，然后依次输入用户名、密码、邮箱。输入密码的时候是看不到字符的，尽管输入就可以了。当操作完了会输出一行日志`Logged in as orange on http://你的IP:4873/.`表示创建用户并登录成功了。

```shell
npm adduser
```

此时你也可以使用`npm whoami`查看你是否登录成功了。

此时你可以创建一个依赖包，然后上传上去了。我们来定义一个依赖包的名称，比如就叫`my-package`，找一个目录输入下面命令：

```shell
mkdir my-package
cd my-package
npm init
```

`npm init`后会让你输入其他的配置项，比如包名是`my-package`，其他的直接按回车，最后输入一个`yes`就可以了。此时你会看到目录下多了一个文件夹叫`my-package`里面有个文件`package.json`。

接下来我们在`my-package`文件夹下，创建一个`index.js`的文件。输入下面的代码，当然如果想输入其他的就看自己的喜好了：

```JavaScript
module.exports = function (){
  console.log(`Hello World!`);
}
```

此时我们已经创建好了一个非常简单的包，然后我们可以上传了，使用shell/cmd进入我们的`my-package`目录，然后输入命令：

```shell
npm publish
```

此时如果看到`+ my-package@1.0.0`说明已经上传成功了，你可以用浏览器打开`http://你的IP:4873/`你会发现确实多了一个包。

如果你在之后上传的时候一定要修改`package.json`的`version`字段，并且要大于现在，否则不能上传。也可以使用命令`npm version 1.0.1`直接修改版本号。

## 使用开发好的依赖包 ##

现在我们使用我们的依赖包，首先在与`my-package`同级目录下再建一个文件夹，比如叫`use-package`。同样使用`npm init`去初始化我们的项目。并且创建一个`index.js`的文件。

此时你可以安装我们刚才发布的那个包了：

```shell
npm install my-package
```

并且在`index.js`中输入以下代码：

```JavaScript
const helloWorld = require('my-package')
helloWorld()
```

此时大功告成，在shell/cmd中打开`use-package`文件夹，然后输入命令`node index`，如果看到`Hello World!`说明我们上传的依赖已经可以使用了。
