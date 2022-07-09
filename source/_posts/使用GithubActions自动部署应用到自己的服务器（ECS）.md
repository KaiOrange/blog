---
title: 使用GithubActions自动部署应用到自己的服务器（ECS）
date: 2020-01-04 16:08:40
author: Orange
tags:
  - Github Actiona
categories: Node
---

最近折腾了一段时间的[Github Actions](https://github.com/marketplace?type=actions)，踩了不少坑，最后成功实现了自动部署到自己的服务器上。**Github Actions**是Github上一个类似于持续集成的功能，它允许你在一些节点上（如提交代码，特定时间等）触发一些操作。我们这里就利用它来实现自动部署应用到自己的服务器。

----

## 自动部署个人博客到服务器 ##

我的个人博客是使用[Hexo](https://github.com/hexojs/hexo)构建的，所以这里就以Hexo为例。

如果没有**Github Actions**我们部署自己的博客需要下面这么几步：

1. 运行`hexo clean`（或者`hexo c`）命令，清空缓存；
2. 运行`hexo generate`（或者`hexo g`）命令，生成编译后的html文件；
3. 运行`hexo deploy`（或者`hexo d`）命令，部署到github的某个分支上；
4. 如果使用自己的服务器，那么还需要在自己服务器把代码拉下来。

现在使用**Github Actions**的话只需要把master分支上的代码提交了，就可以了。具体做法如下：

1. 去Github点击Actions，然后在下面随便选择一个，就比如第一个`Set up this workflow`；

  ![新建Github Actions](1.png)

2. 把下面的`workflow`粘贴到编辑区；

  ![修改workflow内容](2.png)

  ```yml
  # deploy.yml
  name: deploy blog to aliyun
  on:
    push:
      branches:
        - master
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        # 切换分支
        - name: Checkout
          uses: actions/checkout@master
        # 使用 node:10
        - name: use Node.js 10
          uses: actions/setup-node@v1
          with:
            node-version: 10
        # npm install
        - name: npm install
          run: |
            npm install -g hexo-cli
            npm install
          env:
            CI: true
        # build
        - name: hexo build
          run: |
            hexo clean
            hexo generate
          env:
            CI: true

        # Deploy
        - name: Deploy
          uses: easingthemes/ssh-deploy@v2.0.7
          env:
            SSH_PRIVATE_KEY: ${{ secrets.ACCESS_TOKEN }}
            ARGS: "-avz --delete"
            SOURCE: "public/"
            REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
            REMOTE_USER: ${{ secrets.REMOTE_USER }}
            TARGET: ${{ secrets.TARGET }}

  ```

  此时**先别急着点提交**，我们先看看我们的内容。文件中`#`后面的表示是注释，我们不用管。`name`相当于起了一个名字，这个名字可以在部署的时候看的到；只要能看出部署到了哪一步就可以。`on`表示触发条件，这里是`master`分支，`push`的时候会触发，也就是我们推送代码的时候触发这个`workflow`。我们再往下看，`jobs`表示执行的任务，一个`workflow`可以有多个任务。再下面`runs-on`表示运行环境，这里用的是最新的`ubuntu`系统（Linux系统的一种发行版）。`steps`是任务中具体的步骤，里面的每一个`-`代表了一个`action`，其中`action`也可以有自己的`name`，也可以使用`uses`使用别人写好的`action`。那怎么看有哪些`actions`呢？可以看[这里](https://github.com/marketplace?type=actions)，使用别人的`action`的格式是`uses: 用户名/action名称@版本号`。
  此时我们可以看到我们的actions中有一些`切换分支`、`下载 git submodule`、`使用 node:10`、`npm install`等，相信你基本上都可以看得懂，最重要的就是最后一个`action`，他的目的就是把构建好的代码拷贝到自己的服务器的某个目录下。这里的值有些是字符串，有些值是`${ { secrets.XXX } }`这种格式，表示使用变量，使用的目的当然是为了安全，比如我们这里的`secrets.ACCESS_TOKEN`就是一个服务器的私钥，这种东西当然不能公开。现在我们现在设置这些值，所以开头的时候说**先别急着点提交**，因为此时提交了也会报错，下一步就先设置这些值。

3. 在`secrets`下设置需要保密的值。

  浏览器新增一个窗口，打开现在的这个项目的网页，然后点项目后面的`Settings`，然后点击`Secrets`中的`Add a new secret`按钮。

  ![修改workflow内容](3.png)

  首先添加的是`ACCESS_TOKEN`（名字与第二步的`workflow`中名字相同就可以了），这个值**并不是你服务器的密码**。那么这个值是什么呢？首先去你服务器的`~/.ssh`目录，此时目录下应该有4个文件，分别是`authorized_keys`、`id_rsa`、`id_rsa.pub`、`known_hosts`。如果没有`id_rsa`和`id_rsa.pub`的，可以使用`ssh-keygen`来生成，这两个文件就是安装Git时需要生成的私钥和公钥。这个时候你看看`authorized_keys`里面有没有内容，如果有内容说明你之前设置过，`ACCESS_TOKEN`的值就是`authorized_keys`所对应的私钥。如果没有内容的话，你可以直接设置为公钥`id_rsa.pub`的内容，如执行命令`cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys`，此时就会把`id_rsa.pub`的内容写入`authorized_keys`中，然后把`ACCESS_TOKEN`的值设置为私钥`id_rsa`中的内容，你可以运行命令`cat ~/.ssh/id_rsa` 然后把内容复制一份到`ACCESS_TOKEN`中，如下：

  ![设置ACCESS_TOKEN的值](4.png)

  设置`ACCESS_TOKEN`值的**目的是为了远程不使用密码来连接服务器**，当`ACCESS_TOKEN`的值设置好了，接下来就容易了。依次设置`REMOTE_HOST`、`REMOTE_USER`、`TARGET`的值，比如`47.111.177.111`、`root`、`/home/blog`等，具体的根据自己的ECS来设置。

4. 提交`workflow`文件。

  浏览器的标签切换到刚才的那个页面，然后提交`workflow`。当提交后可以看到代码的根目录下多了一个`.github/workflows/deploy.yml`文件（文件名叫什么无所谓），然后点击Actions标签看有一个`workflow`在运行，等待一会，如果显示如下，说明就好了：

  ![设置成功](5.png)

  如果你老老实实按照上面的步骤来做的话，基本上不会有什么问题，如果你执行后报错如下，说明失败了：

  ![设置失败](6.png)

  上面这个错非常典型，主要原因有两种一个就是没有连上你的主机，你可以检查一下你的私钥什么的看有没有配置错误。另外有可能你是的目录配置的有问题。通常首次在云服务上部署的时候，云服务器运营商会发短信或者邮件告诉你登录异常，如果出现这个的时候说明已经登录上去了，那就很可能是目录等配置的有问题。

通过上述设置后只要往master推送，就可以自动构建了，非常方便。

## 自动部署前端应用到服务器 ##

前端应用往往都是静态的页面，大多数都会基于`vue-cli`或者`create-react-app`等脚手架来开发的。这些脚手架构造的应用往往运行`npm run build`命令，然后生成`dist`目录，再通过`nginx`等服务器来启动。我们这里也使用这样的场景。

上面我们使用的是Github自带的创建方式，现在我们直接在代码的根目录创建`.github/workflows/deploy.yml`文件。然后在项目的`Settings`下的`Secrets`里面添加上面的内容，最后复制如下代码到`.github/workflows/deploy.yml`文件中：

```yml
# deploy.yml
name: deploy to aliyun
on:
  push:
    branches:
      - master
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # 切换分支
      - name: Checkout
        uses: actions/checkout@master
      # 下载 git submodule
      - uses: srt32/git-actions@v0.0.3
        with:
          args: git submodule update --init --recursive
      # 使用 node:10
      - name: use Node.js 10
        uses: actions/setup-node@v1
        with:
          node-version: 10
      # npm install
      - name: npm install and build
        run: |
          npm install
          npm run build
        env:
          CI: true
      # Deploy
      - name: Deploy
        uses: easingthemes/ssh-deploy@v2.0.7
        env:
          SSH_PRIVATE_KEY: ${{ secrets.ACCESS_TOKEN }}
          ARGS: "-avz --delete"
          SOURCE: "dist/"
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: ${{ secrets.TARGET }}
```

可以看到步骤和之前的基本上如出一辙。

## 题外话：使用ACCESS_TOKEN是否安全 ##

是否安全呢？首先需要告诉你的是，如果有人知道`ACCESS_TOKEN`与你的服务器的地址那么就可以不用密码登录到你的服务器。但是Github作为一个有责任的、受社会监督的公司，是绝对不会泄露和使用你的这些数据的。但是你需要确保你添加`Secrets`时的网络环境是否安全。总的来说，**安全是相对的**，使用Github Actions提交的安全隐患是有的，不过大多数情况下还是认为可以信赖的。

参考文档：
> [GitHub Actions 入门教程 - 阮一峰](http://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html)
> [GitHub Actions 教程：定时发送天气邮件 - 阮一峰](http://www.ruanyifeng.com/blog/2019/12/github_actions.html)
> [真香！GitHub Action一键部署 - Yopai](https://didiheng.com/front/2019-12-11.html)

