---
title: JavaScript中的正则表达式
date: 2019-04-13 14:35:29
author: Orange
tags:
  - 正则表达式
categories: JavaScript
---

> 正则表达式（Regular Expression）描述了一种字符串匹配的模式，可以用来检查一个字符串是否含有某种子串，将匹配的子串做替换或者从某个串中取出符合某个条件的子串等。

### 创建正则对象 ###

1. 语法模拟
```JavaScript
var regExp = /\d/gi;
```
2. new创建
```JavaScript
var regExp = new RegExp("\\d","gi");
```

两者的区别：如果使用new来创建那么需要对正则表达式进行转义如`\d`需要转义为`\\d`，`\\`需要转义为`\\\\`。

### 匹配标示 ###

匹配标示|含义
---|---
g|全局匹配
i|忽略大小写
m|多行搜索

### 正则表达式的使用 ###

JavaScript中正则表达式的使用涉及2个类型，一个就是上面的`RegExp`，还有一个就是我们常用的`String`。
RegExp对象正则处理常用的方法：

方法|描述|使用
---|---|---
test|匹配参数是否出现在字符串中|regExp.test(str);
exec|返回匹配模式的字符串|regExp.exec(str);

String对象正则处理常用的方法：

方法|描述|使用
---|---|---
search|匹配符合匹配规则的字符串出现的位置|str.search(regExp);// 没匹配到返回-1
match|返回匹配模式的字符串（返回数组）|str.match(regExp);// 没匹配到返回null
replace|使用指定的内容替换匹配到的字符串|str.replace(regExp,"新的字符串或函数");
split|使用匹配到的字符串进行分割字符串（返回数组）|str.split(regExp);// 没匹配到返回整个字符串的数组

此外regExp对象还有几个不太常用的属性：
```JavaScript
var regExp = /\d/gi;
console.log(regExp.global);// 是否全局变量 如果有标识符g 那么返回true 这里打印true
console.log(regExp.ignoreCase);// 是否忽略大小写 如果有标识符i 那么返回true 这里打印true
console.log(regExp.multiline);// 是否多行 如果有标识符m 那么返回true 这里打印false
console.log(regExp.source);// 匹配规则 这里打印\d
console.log(regExp.lastIndex);// 开始搜索下一个匹配项的位置 这里打印0
```

### 子表达式与反向引用 ###

这里有几个比较重要的概念：
> **子表达式**：在正则匹配中，使用一对括号括起来的内容就是子表达式。
> **捕获**：在正则匹配中，子表达式匹配到的内容会被系统捕获到系统的缓冲区中。
> **反向引用**：当捕获以后，可以在匹配模式中使用`\n`（n表示数字，从**1**开始），来引用系统中第几号缓冲区的内容。

我们看个例子，假设我们要匹配两个相同单词（这里的单词其实是指多个字母）中间是三个数字的内容，如`a123a`、`abc666abc`这种的：
```JavaScript
var str = "java123javabbb1232bccccc322deee666e";
var regExp = /(\w+)\d{3}\1/gi;// 捕获多个字母 中间是3个数字 然后后面的内容与前面的相同
var result = str.match(regExp);
console.log(result);// ["java123java", "e666e"]
```
是不是有点明白了，不明白我们再看一个简单的例子，查找如`1221`、`6886`这样的`ABBA`形的数字：
```JavaScript
var str = "12213456886";
var regExp = /(\d)(\d)\2\1/gi;// 捕获2个数字 然后先是第二个数字 后是第一个数字
var result = str.match(regExp);
console.log(result);// ["1221", "6886"]
```

**通常情况下，后面内容和前面内容一致的情况下，就使用到子表达式、捕获、反向引用的概念了。**

上面的例子也可以使用`RegExp`对象的`exec`方法：
```JavaScript
var str = "12213456886";
var regExp = /(\d)(\d)\2\1/gi;
var result;
while(result = regExp.exec(str)){
    console.log(result);
    // 分别打印：
    // ["1221", "1", "2", index: 0, input: "12213456886", groups: undefined]
    // ["6886", "6", "8", index: 7, input: "12213456886", groups: undefined]
}
```

可见，exec方法需要循环打印，打印的结果也更加全面。如果要获取匹配到的内容可以获取下标为`0`的元素。

### 限定符 ###

> 限定符可以指定正则表达式的一个给定内容必须出现多少次才能满足匹配。

如上面例子中`var regExp = /(\w+)\d{3}\1/gi;`其中`{3}`就是限定符，限制必须出现3次。更多的限定符可以看这里：

限定符|含义
---|---
*|匹配0次或多次
+|匹配1次或多次
?|匹配0次或1次
{n}|匹配n次，n为数字
{n,}|匹配n次或多次（至少n次）
{n,m}|最少匹配n次，最多匹配m次

由上可见，`*`相当于`{0,}`，`+`相当于`{1,}`，`?`相当于`{0,1}`

我们再看一个例子:
```JavaScript
var str = "123456aaaaa5678";
var regExp = /\d{3,5}/gi;
var result = str.match(regExp);
console.log(result);// ["12345", "5678"]
```
上式中`123`其实也是满足我们的正则表达式，但是JS中的正则匹配是**贪婪匹配**的，他会尽可能多的去匹配。

### 定位符 ###

> 定位符可以将一个正则表达式固定在一行的开始或结束。也可以固定在单词的开始或结尾出。

定位符|含义
---|---
^|匹配开始的位置
$|匹配结束的位置
\b|匹配一个单词边界，前面是开始位置或者后面是结束位置，或者有空格
\B|匹配非单词边界

如`var regExp = /^h/gi;`匹配以`h`开头的内容，`var regExp = /ld$/gi;`匹配以`ld`结尾的内容。

### 常用匹配规则 ###

匹配规则|含义
---|---
[a-z]|标示a-z任意一个字符
[A-Z]|标示A-Z任意一个字符
[0-9]|标示0-9任意一个字符
[0-9A-Z]|标示0-9或者A-Z任意一个字符
[abcd]|标示a或者b或者c或者d
[^A-Z]|标示排除A-Z外的任意一个字符
\d|匹配一个数字，即[0-9]
\D|匹配一个非数字，即[^0-9]
\w|匹配单词字符，也就是数字字母下划线，即[0-9a-zA-Z_]
\W|匹配非单词字符，如！￥等
\s|匹配空白字符，空格、换行、制表符等
\S|匹配非空白字符
.|（看得清吗，一个点）匹配非换行外的任意字符

那如果要匹配所有的任意字符怎么办？是用`[.\n]`就可以了。这里列出了一些常用的匹配规则，更多更详细的规则可以看[这里](https://baike.baidu.com/item/%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BE%E5%BC%8F/1700215?fr=aladdin#7)。

### 转义符 ###

转义符`\`用来转义正在表达式子中有特殊意义的符号。就比如匹配一个左括号，那么就需要转义一下`var regExp = /\(/;`。需要转义的字符有：`(){}[]\/.*+?^$`等。

### 预查 ###

1. 正向预查(?=)
```JavaScript
var str = "雷锋好人，雷锋大好人";
var regExp = /雷锋(?=好人)/gi;// 匹配后面是"好人"的雷锋 即第一个雷锋
var result = str.match(regExp);
console.log(result);// ["雷锋"]
```

2. 负向预查(?!)
```JavaScript
var str = "雷锋好人，雷锋大好人";
var regExp = /雷锋(?!好人)/gi;// 匹配后面不是"好人"的雷锋 即第二个雷锋
var result = str.match(regExp);
console.log(result);// ["雷锋"]
```

3. 结果不被捕获(?:)
```JavaScript
// 捕获字母或者数字后面跟着两个相同的数字的内容
var str = "a123b11";
// 因为我们第一个是字母或数字需要上一个括号表示整体 但是我们不希望被捕获 
var regExp = /(?:\d|\w)(\d)\1/gi;
var result = str.match(regExp);
console.log(result);// ["b11"]
```

### 经典案例 ###
将"我...我.....我..是.是....是一个个....个帅帅帅....帅帅帅哥"转化为"我是一个帅哥""。
```JavaScript
var str = "我...我.....我..是.是....是一个个....个帅帅帅....帅帅帅哥";
var regExp = /\./gi;// 因为.是特殊字符 需要转义
str = str.replace(regExp,"");// 第一步去掉空格
regExp = /(.)\1+/gi;// 这里的点表示任意非换行字符 然后匹配多个 一定要注意这里必需有g标示
str.replace(regExp,"$1");// $1类似于正则中的\1 
console.log(str);// "我是一个帅哥"
```