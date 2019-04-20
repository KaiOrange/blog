---
title: HTTP文件缓存判断流程
date: 2019-04-20 13:28:07
author: Orange
tags:
  - 缓存
categories: HTTP
---

![HTTP文件缓存判断流程](1.png)

缓存判断流程：
1. 如果`Cache-Control`（或者`Expires`，`Expires`绝对时间，优先级比`Cache-Control`低）未过期，那么使用缓存，否则按照下一条来判断。
2. 如果有`Etag`，则会向服务器发送`Etag`和`If-None-Match`，由浏览器来判断是`200`还是`304`。如果没有`Etag`那么按照下一条来判断。
3. 浏览器判断**上次文件响应头**中是否有`Last-Modified`信息，有则连同`If-Modified-Since`一起发送到服务器，由服务器来判断`200`还是`304`。
4. 如果以上都没有使用，那么浏览器请求一次服务器，返回`200`。