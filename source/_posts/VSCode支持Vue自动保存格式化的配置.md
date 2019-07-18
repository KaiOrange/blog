---
title: VSCode支持Vue自动保存格式化的配置
date: 2019-07-18 14:03:46
author: Orange
tags:
  - 配置
categories: VSCode
---

## 安装插件 ##

安装三个插件：`Prettier - Code formatter`、`ESLint`、`Vetur`。对应的插件图片如下：
![Prettier - Code formatter](1.jpeg)
![ESLint](2.jpeg)
![Vetur](3.jpeg)

## 修改配置文件 ##

MacOS使用`Command + Sheft + P`，windows使用`Ctrl + Sheft + P`搜索`首选项:打开设置(json)`,然后把下面配置粘贴进去：

![首选项:打开设置(json)](4.jpeg)

```JSON
{
  // 分号
  "prettier.semi": false,
  "prettier.eslintIntegration": true,
  // 单引号包裹字符串
  // 尽可能控制尾随逗号的打印
  "prettier.trailingComma": "all",
  "prettier.singleQuote": true,
  "prettier.tabWidth": 2,
  // 关闭自带的格式化
  "javascript.format.enable": false,
  // 让函数(名)和后面的括号之间加个空格
  "javascript.format.insertSpaceBeforeFunctionParenthesis": true,
  // 启用eslint
  "eslint.enable": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    {
      "language": "vue",
      "autoFix": true
    }
  ],
  // 格式化.vue中html
  "vetur.format.defaultFormatter.html": "js-beautify-html",
  // 让vue中的js按编辑器自带的ts格式进行格式化
  "vetur.format.defaultFormatter.js": "vscode-typescript",
  "vetur.format.defaultFormatterOptions": {
    "js-beautify-html": {
      "wrap_attributes": "force-aligned" // 属性强制折行对齐
    }
  },
  "vetur.format.enable": true,
  "eslint.options": {
    "extensions": [".js", ".vue"]
  },
  "eslint.autoFixOnSave": true,
  "editor.tabSize": 2,
  // 开启行数提示
  "editor.lineNumbers": "on",
  // 去掉 vscode 自带的自动保存 ，vscode 默认也是 false
  "editor.formatOnSave": false,
  // vscode默认启用了根据文件类型自动设置tabsize的选项
  "editor.detectIndentation": false,
  "editor.quickSuggestions": {
    //开启自动显示建议
    "other": true,
    "comments": true,
    "strings": true
  },
  "extensions.ignoreRecommendations": false,
  "window.zoomLevel": 1,
  "files.autoGuessEncoding": false,
  "workbench.sideBar.location": "left"
}

```

## 确保和项目配置不冲突 ##

如果项目配置和VSCode默认的配置有冲突可能会出现问题，请确保根目录下的`.vscode/settings.json`文件和上面的文件并不冲突，可以把`.vscode/settings.json`设置为一个空JSON。

![.vscode/settings.json](5.jpeg)
