---
title: Keep APP技术研究
date: 2020-07-14 10:03:23
author: Orange
tag:
	- Keep
categories: 运动与健身
---

最近在研究运动软件[Keep](https://www.gotokeep.com/)，就是那个`自律给我自由`的Keep。主要方法是使用[Charles](https://www.charlesproxy.com/)来抓包，然后查看接口。由于`Charles`是一款Mac的应用，所以`Windows`系统，可能不能实践了。另外安卓手机限制不能抓包HTTPS的协议，所以也不能实践了。

现在分享一下我的研究成果，本文可能触及到Keep软件的一些特殊操作，大家谨慎使用，本文仅供学习和交流使用，如果侵犯到Keep的相关利益，请联系我。

----

Keep是典型的混合式开发，也就是`前端H5 + 后端 + 移动端（安卓和iOS）`，大多界面都是使用了前端技术开发的，主要前端框架是基于VUE来做的。

## 主要域名 ##

> 后端服务域名：https://api.gotokeep.com
> 主站H5：https://show.gotokeep.com
> 活动等H5：https://m.gotokeep.com
> 静态资源CDN：https://static1.keepcdn.com
> 监控：https://apm.gotokeep.com
> 智能设备：https://kit.gotokeep.com

## userAgent ##

`userAgent`是混合开发中，H5用来识别APP内部与外部的重要依据。前端可以通过`JavaScript`代码`window.navigator.userAgent`来获取，`Keep`的userAgent`如下：

> Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;Keep/6.43.0 (iPhone; iOS 13.5.1; Scale/2.00);Keep/6.43.0 (iPhone; iOS 13.5.1; Scale/2.00)

当然不同系统是不一样的，其中最重要的是最后`Keep/版本号(其他信息)`这一段，至于为什么要写2遍，我也不清楚，难道客户端植入的时候多写了一遍？

## 调试页面 ##

Keep线上的页面都是线上环境，调试线上环境的其实也没有多大的意义。由于我们拿不到Keep的源代码，所以只能通过线上代码简单地看看Keep页面的结构。

Keep使用了`vue + vue-router + vuex`这样的框架组合，它的页面链接的最后一级是用户的userId，我们以“我的等级”页面为例，如：`https://show.gotokeep.com/experience/grades/xxxxxxxxxxxxxxxxxxxxxxxx?kg=16`其中`xxxxxxxxxxxxxxxxxxxxxxxx`就是userId，由于用户的userId是隐私数据，所以我就那x来代替了（下面所有有userId的地方，我都会用`xxxxxxxxxxxxxxxxxxxxxxxx`来代替）。

浏览器直接打开这个页面，发现报错了，仔细一看，你会发现是接口`https://api.gotokeep.com/diamond/v1/users/xxxxxxxxxxxxxxxxxxxxxxxx/privilegeWall/levels`返回了`401`，接口`401`说明没有授权。为了让页面实现在Keep中同样的效果，可以做下面的几步：

1. 让H5页面识别浏览器为Keep站内。

    要识别站内就是使用上面的`userAgent`，打开开发者工具，然后选择`Network conditions`面板，去掉`Select automatically`的勾选，然后把上面的`userAgent`粘贴到下面的输入框中，如下，然后刷新一下`userAgent`就生效了。

    ![修改userAgent](1.png)

2. 获取cookie。

    Keep接口认证是基于`JWT`来实现的。我们使用`Charles`来查看任一接口的`cookie`，会发现有一个`authorization`的字段，这个就是`JWT`的关键，如下：

    ![查看cookie](2.png)

3. 设置cookie。

    为了页面能正常运行，我们把所有的`cookie`信息，都设置进去。打开浏览器的开发者工具，然后依次把`cookie`粘贴进去，如下：

    ![设置cookie](3.png)

此时刷新页面，可以看到页面已经可以正常运行了，如下：

![运行的页面](4.png)

## 客户端事件 ##

客户端事件是H5和客户端（这里只有移动端）交互的指令，其实就是一个特定协议的字符串，前端使用`location.href = 客户端事件字符串`来执行客户端事件，在Keep中为了方便调试，也可以扫码来执行这些事件。举个例子，打开webview的事件是`keep://webview/`后面跟着encode的URI就可以实现跳转页面了，比如要使用Keep来跳转本博客，就可以如下：`keep://webview/https%3a%2f%2fwww.kai666666.com%2f`，你可以使用[这个工具](http://tool.chinaz.com/tools/urlencode.aspx)来encode，把刚才的事件，转换为二维码，如下：

![二维码](5.png)

现在打开Keep扫一扫，上面的二维码，你就可以用Keep进入本博客网站了。要把字符串转换为二维码可以使用[草料二维码](https://cli.im/text)。

在`https://api.gotokeep.com/config/v2/basic?refresh=true`接口中定义了更多的事件：

描述|事件
:---:|:---
精选|keep://discover_web
训练|keep://discover_course
饮食|keep://discover_food
商城|keep://discover_store
精选|keep://discovery/explore
训练|keep://discovery/course
攻略|keep://discovery/guide
饮食|keep://discovery/diet
商城|keep://discovery/product
推荐|keep://hottabs/hot
热门视频|keep://hottabs/video
运动时刻|keep://hottabs/story
training_训练课程|keep://discover_course/
activity_热门活动|keep://hot_activities
hashtag_话题讨论|keep://hashtags_index
group_小组推荐|keep://groups_index/
kol_达人推荐|keep://recommend_keepers/
article_精选文章|keep://selections
热门|keep://timeline/hot
关注|keep://timeline/follow
逛逛|keep://timeline/wander
训练|keep://homepage/content?tabId=ZnVsbENvbnRlbnQ=
跑步|keep://homepage/running?tabId=cnVubmluZw==
瑜伽|keep://homepage/yoga?tabId=eW9nYQ==
行走|keep://homepage/hiking?tabId=aGlraW5n
骑行|keep://homepage/cycling?tabId=Y3ljbGluZw==
Kit|keep://homepage/keloton?tabId=a2Vsb3Rvbg==
数据中心|keep://datacenter?type=all&period=day
跑步历史记录|keep://datacenter?type=running&period=day
每周目标|keep://weeklypurpose
身体档案|keep://bodydata
运动能力|keep://physical_test_list
运动概况|keep://physical_summary
运动日记|https://show.gotokeep.com/usersfulldiary
步数记录|keep://steps_dashboard
连接应用和设备|keep://oauth/list
我的收藏|keep://my_favorites
我的活动|keep://activities
训练营历史|keep://bootcamp/history
我的路线|keep://my_running_routes
我的运动小队|https://show.gotokeep.com/outdoor/groups/list
我的最佳成绩|keep://running/best_records
我的 Class|keep://classes/mine
购物车|keep://shopping_cart
我的钱包|https://show.gotokeep.com/wallet
优惠券|keep://store_coupons
购买记录|keep://purchase_history
Keepland 课程|https://keepland.gotokeep.com/my_course?pulldownrefresh=true

从上面可以看到很多`https://show.gotokeep.com`开头的地址用Keep扫码也是可以直接进入的，但是我们自己的`https`网站却不能，可见Keep对自己的白名单内的域名做了特殊处理（相当于其他页面使用了`keep://webview/`事件）。

## 小应用 ##

Keep并没有提供一种查看自己跑了多少个全马，或者跑了多少个半马这样的功能。现在我们写个脚本把自己的跑步数据存入我们自己的数据库中，并通过SQL查询出我们跑了多少个半马。

这里假设你已经安装了`MySQL`，并且已经建立了一个名叫`keep_running`的数据库。

建表脚本如下：

```SQL
DROP TABLE IF EXISTS running_data;

CREATE TABLE IF NOT EXISTS running_data (
  id VARCHAR(100) NULL,
  statsType VARCHAR(100) NULL,
  trainingCourseType VARCHAR(100) NULL,
  subtype VARCHAR(100) NULL,
  statsName VARCHAR(100) NULL,
  doneDate VARCHAR(100) NULL,
  icon VARCHAR(100) NULL,
  statsSchema VARCHAR(100) NULL,
  workoutFinishTimes INT NULL,
  duration INT NULL,
  distance INT NULL,
  steps INT NULL,
  kmDistance DOUBLE NULL,
  calorie INT NULL,
  averagePace DOUBLE NULL,
  averageSpeed DOUBLE NULL,
  exerciseInfo VARCHAR(500) NULL,
  statsStatus INT NULL,
  trackWaterMark VARCHAR(100) NULL,
  workoutId VARCHAR(100) NULL,
  vendorSource VARCHAR(100) NULL,
  vendorManufacturer VARCHAR(100) NULL,
  vendorGenre VARCHAR(100) NULL,
  vendorDeviceModel VARCHAR(100) NULL,
  vendorRecordId VARCHAR(100) NULL,
  heartRates TEXT NULL,
  averageHeartRate DOUBLE NULL,
  maxHeartRate VARCHAR(100) NULL,
  isDoubtful VARCHAR(100) NULL,
  logsType VARCHAR(100) NULL,
  statsDate VARCHAR(100) NULL,
  calorieSum INT NULL,
  durationSum INT NULL
);
```

要得到自己的跑步数据，可以调用`https://api.gotokeep.com/pd/v3/stats/detail`接口来获取，由于浏览器端会有跨域的问题，所以我们就直接跑一个node脚本就行了。

这里需要用到额外的两个库，一个是[axios](https://github.com/axios/axios)，用来发送http请求的；另一个库就是[mysql](https://github.com/mysqljs/mysql)，用来把数据存到数据库的。大家自己运行npm install一下。

脚本大致如下：

```JavaScript
const axios = require('axios').default
const mysql = require('mysql');
const connection = mysql.createConnection({
  host     : "localhost",
  user     : "root",
  password : "自己的数据库密码",
  database : "keep_running"
});

connection.connect();

queryAndInsert(connection);


let globalIndex = 1;

function queryAndInsert(connection,lastDate){
  axios.get('https://api.gotokeep.com/pd/v3/stats/detail', {
    params: { dateUnit: 'all',type:'running',lastDate },
    withCredentials: true,
    headers:{
      // TODO:这里是headers的数据，需要使用你自己的 不然查询会失败的
    }
  }).then(res=>{
    let sql =
    `INSERT INTO running_data (
      id, statsType, trainingCourseType, subtype, statsName,
      doneDate, icon, statsSchema, workoutFinishTimes, duration,
      distance, steps, kmDistance, calorie, averagePace,
      averageSpeed, exerciseInfo, statsStatus, trackWaterMark, workoutId,
      vendorSource, vendorManufacturer, vendorGenre, vendorDeviceModel, vendorRecordId,
      heartRates, averageHeartRate, maxHeartRate, isDoubtful, logsType,
      statsDate, calorieSum, durationSum)
      VALUES(?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?);`
    let data = res.data.data
    let lastTimestamp = data.lastTimestamp
    if (lastTimestamp === 0 || !data.records || data.records.length === 0) {
      connection.end();
    } else {
      let posts = []
      data.records.forEach(record=>{
        (record.logs||[]).forEach(log=>{
          let stats = log.stats
          if (stats) {
            stats.vendor = stats.vendor || {}
            stats.heartRate = stats.heartRate || {}
            posts.push([
              stats.id, stats.type, stats.trainingCourseType, stats.subtype, stats.name,
              stats.doneDate, stats.icon, stats.schema, stats.workoutFinishTimes, stats.duration,
              stats.distance, stats.steps, stats.kmDistance, stats.calorie, stats.averagePace,
              stats.averageSpeed, stats.exerciseInfo, stats.status, stats.trackWaterMark, stats.workoutId,
              stats.vendor.source, stats.vendor.manufacturer, stats.vendor.genre, stats.vendor.deviceModel, stats.vendor.vendorRecordId,
              stats.heartRate.heartRates, stats.heartRate.averageHeartRate, stats.heartRate.maxHeartRate, stats.isDoubtful, log.type,
              record.date,  record.calorieSum,  record.durationSum
            ])
          }
        })
      })

      posts.forEach(post=>{
        connection.query(sql, post, function (error, results, fields) {
          if (error) throw error;
          console.log('成功插入了一条数据：' + globalIndex);
          globalIndex++;
        });
      })

      queryAndInsert(connection,lastTimestamp)
    }
  })
}
```

注意上面`headers`处，需要换成自己数据的键值对形式，在`Charles`中获取方式如下：

![获取headers数据](6.png)

最后你就可以通过SQL语句查询数据了：

```SQL
# 全马
SELECT * FROM running_data WHERE distance > 42195 ORDER BY distance DESC;

# 半马
SELECT * FROM running_data WHERE distance >= 21097.5 and  distance < 42195 ORDER BY distance DESC;

# 10公里
SELECT * FROM running_data WHERE distance >= 10000 and  distance < 21097.5 ORDER BY distance DESC;

# 5公里
SELECT * FROM running_data WHERE distance >= 5000 and  distance < 10000 ORDER BY distance DESC;
```

通过数据查询可以看出我自己跑了10个半马了😀。

![我的成绩](7.png)
