---
title: 《CSS选择器世界》读书笔记
date: 2021-05-23 14:00:27
author: Orange
tags:
  - CSS
categories: 读书笔记
---

你敢相信吗，CSS选择器都可以写一本书！张鑫旭大佬的这本书绝对值得一读！

![《CSS选择器世界》](1.jpg)

----

### 概述 ###

CSS选择器可分为4类：选择器（如body{}）、选择符（如相邻兄弟关系选择符+）、伪类（如:hover）和伪元素（如::before）。

CSS只有一个全局作用域，但是Shadow DOM中的样式不会影响外面的样式。

### CSS选择器的优先级 ###

等级|选择器|例子
---|---|---
0级| 通配选择器、选择符和逻辑组合伪类 | 通配选择器*、选择符（+、~、空格、>）、伪类如:not等
1级| 标签选择器 | body {}
2级| 类选择器、属性选择器和伪类 | .foo{} <br/> [foo]{} <br/> :hover
3级| ID选择器 | #foo{}
4级| style属性内联 | `<span style="color:red;">文字</span>`
5级| !important | .foo{color:red !important;}

举例：

```HTML
<style>
body .foo {color:red;}
html .foo {color:blue;}
</style>

<div class="foo">这里是什么颜色</div>
```

这里`html`与`body`等级相同，`.foo`也是一样的，所有优先级是相同的，**如果优先级相同时，就符合后来居上的原则**，所以是蓝色的。

部分资料上优先级是按照计数来算的，但是并不意味着10个类选择器和一个id选择器优先级相同，**上一级比下一级有永远无法逾越的差距**，但是IE浏览器256个上一级选择器要比下一级的优先级大（老式浏览器8字节存储所导致的），现代浏览器则没有此问题。

### CSS选择器的命名 ###

选择器大小写敏感问题：

选择器类型|示例|是否大小写敏感
---|---|---
标签选择器| div{} | 不敏感
属性选择器-纯属性| [attr] | 不敏感
属性选择器| [attr=val] | 属性不敏感、值敏感
类选择器| .container | 敏感
ID选择器| #id | 敏感

选择器命名可以以数字开头，但是在CSS中需要转义，如下面是合法的：

```HTML
<style>
.1-foo {color:red;} /* 不合法 */
.\31 -foo{color:blue;} /* 合法，注意有个空格，\Unicode简写 加空格，如果不简写则不需要空格  */
.\000031-foo{color:blue;} /* 合法 */
</style>

<div class="1-foo">这里是什么颜色</div>
```

CSS的命名可以是中文、中文标点符号甚至Emoji.

### 精通CSS选择符 ###

四大选择符：后代选择符（空格），孩子选择器（>），相邻兄弟选择符（+）、后面兄弟选择符（~）。

思考题：

```HTML
<style>
.red {color:red;}
.blue {color:blue;}
</style>

<div class="red">
  <div class="blue">
    <p>1. 颜色是？</p>
  </div>
</div>
<div class="blue">
  <div class="red">
    <p>2. 颜色是？</p>
  </div>
</div>
```

上面1和2是什么颜色呢？由于颜色都是继承自父标签的，所有应该取距离近的父标签的颜色，所以第一个是蓝色，第二个是红色。修改此题如下：

```HTML
<style>
.red p {color:red;}
.blue p {color:blue;}
</style>

<div class="red">
  <div class="blue">
    <p>1. 颜色是？</p>
  </div>
</div>
<div class="blue">
  <div class="red">
    <p>2. 颜色是？</p>
  </div>
</div>
```

本题稍微变化了一下，这里1和2的颜色不是继承来的，而是匹配到了CSS样式，并且2个样式都可以匹配到，此时就得看优先级了，由于优先级相同，所以后来居上故都是蓝色的。

JS获取元素补充说明：

```HTML
<div id="myId">
  <div class="blue">2</div>
  <div class="blue">
    <div>2</div>
  </div>
</div>

<script>
document.querySelectorAll('#myId div div').length // 1
document.querySelector('#myId').querySelectorAll('div div').length // 3 某个元素的querySelectorAll会把自己也算进去 不算进去则使用下面
document.querySelector('#myId').querySelectorAll(':scope div div').length // 1
</script>
```

相邻兄弟选择符（+），选择的是元素，会忽略中间的文本和注释，如下面3个p标签都是红色的：

```HTML
<style>
h4 + p {
  color: red;
}
</style>

<h4>标题</h4>
<p>文字</p>

<h4>标题</h4>
这里是文字
<p>文字</p>

<h4>标题</h4>
<!-- HTML注释 -->
<p>文字</p>
```

### 元素选择器 ###

元素选择器包括标签选择器和通配符选择器。

多个选择器时，元素选择器必须写在前面，如这样是不合法的`[type=radio]input {} 或者 [type=radio]* {}`

### 属性选择器 ###

7种属性选择器格式：

选择器格式|匹配规则|举例|说明
---|---|---|---
[attr]| 包含指定属性就可以了 | `[disabled] {}` | boolean型属性用的比较多
[attr="val"]| 属性和值都需要匹配 | `[type="radio"] {}` | 值可以是单引号、双引号或者不写，结果都是一样的
[attr~="val"]| 值包含则匹配（val必须是一个值，不能是值里面的一部分） | `[rel~="noopener"] {}` | 匹配：`<a rel="noopener nofollow"></a>` <br/> 不匹配：`<a rel="123noopener123"></a>`
[attr&#124;="val"]| 值起始片段相同（片段是指用-连接的属性值） | `[attr&#124;=val] {}` | 匹配：`<div attr="val"></div>`  <br/>匹配：`<div attr="val-us val2"></div>`  <br/>不匹配：`<div attr="val val2"></div>`  <br/>不匹配：`<div attr="value"></div>`
[attr^="val"]| 属性值以val开头的元素 | `[href^="https"] {}` | 匹配href以https开头的元素
[attr$="val"]| 属性值以val结尾的元素 | `[href$=".pdf"] {}` | 匹配href以.pdf结尾的元素
[attr*="val"]| 属性值包含val的元素 | `[attr*=val] {}` | 匹配：`<div attr="value"></div>` \n 匹配：`<div attr="aaa val bbb"></div>`

之前说过属性选择器，属性是忽略大小写的，属性的值是大小写敏感的，如果需要属性值也忽略大小写的话可以在属性中加一个i或者I，则表示大小写不敏感，如：`[attr*="val" i]`。

### 用户行为伪类 ###

手型经过伪类`:hover`。

激活状态伪类`:active`。

焦点伪类`:focus`可以生效的元素：

1. 非disabled状态的表单元素；
2. 包含href属性的a元素；
3. `<area>`元素，不过可生效的CSS属性有限；
4. HTML5中的`<summary>`元素。

其他元素不能生效，非要生效可以设置属性`contenteditable="true"`或者添加属性`tabindex="数字"`。

一个页面最多只有一个元素响应`:focus`。

整体焦点伪类`:focus-within`，在当前元素或者当前元素的任意子元素处于聚焦状态的时候都会匹配。（少有的子元素行为决定父元素的伪类选择器）

键盘焦点伪类`:focus-visible`，元素聚焦，同时浏览器认为聚焦轮廓应该显示。（目前只有Chrome支持）

### URL定位伪类 ###

`:link`伪类用来匹配页面上href链接没有访问过的`<a>`元素，已访问的元素则不匹配（用处不大，通常直接用a标签选择符就可以了）。

a标签相关的四个伪类的优先级：`:link` > `:visited` > `:hover` > `:active`（LVHA lova-hate）。

`:visited`标签访问过选择器，该选择器由于安全考虑有以下特性：

1. 支持的CSS有限，只支持color，background-color，border-color，border-bottom-color，border-left-color，border-right-color，border-top-color，column-rule-color，outline-color，不支持伪元素；
2. 颜色不支持半透明；
3. 只能重置，不能设置原来没设置的样式（如要设置`background-color`则a标签的样式需要设置过`background-color`）；
4. JS的`getComputedStyle()`方法无法获取到色值。

`:any-link`不兼容IE11，其他浏览器兼容性良好，匹配规则如下：

1. 匹配所有设置了href属性的链接元素，包括`<a>`，`<link>`和`<area>`；
2. 匹配所有匹配`:link`伪类或者`:visited`伪类的元素。

`:target`：当浏览器是有锚点与当前元素相同时则匹配，这里的锚点也就是路由上hash指向的id所对应的元素。该伪类有一个特性，就是当元素不显示的时候也能匹配，但是不显示的时候设置当前元素的样式也不会有什么效果，毕竟不显示嘛，但是可以操作他后面的兄弟节点（可以利用该伪类选择器实现“显示全部”的功能）。

`:target-within`：匹配`:target`伪类匹配的元素，或者后代存在匹配`:target`伪类的元素的元素。目前还没有浏览器支持！😢

### 输入伪类 ###

`:enabled`元素可用，`:disabled`元素不可用，他们是对立的，`readonly`的表单是`:enabled`的，另外`:enabled`可以用在a标签上，a标签没有`:disabled`状态，哪怕给a标签设置了disabled属性。

`:read-only`表单只读，`:read-write`表单可读可写（默认就是，比较鸡肋）。表单disabled的时候匹配的是`:read-write`，虽然此刻也不能写😂。

`:placeholder-show`：占位符显示时匹配，由于占位符是在输入内容为空的时候出现，所以可以使用`:placeholder-show`来判断表单是否为空。

`:default`：默认状态的表单选中元素，如select标签下的option可以给一个默认值，这个默认值就可以用`:default`匹配。这里需要注意的时候如果option标签没有给默认值的时候`:default`并不会匹配，但是浏览器会默认选中第一个元素。

`:checked`：checkbox选中时的伪类。

checkbox的`:checked`伪类比`[checked]`属性选择器优势在于JS控制选中的时候（`checkbox.chencked = true`这种情况），由于没有改变checked属性，所以`[checked]`不准确，而`:checked`则不会有问题。同样的`:disabled`和`[disabled]`也一样，另外`:disabled`是表单元素实际是否被禁用，比如表单外面包裹着一层`<fieldset disabled>`，里面的表单元素则是禁用状态，此时`:disabled`能匹配到，但是由于里面的表单元素没有加disabled属性所以`[disabled]`匹配不到。

`:indeterminate`：不确定值伪类，实际上就是当JS设置`checkbox.indeterminate = true`的时候则会匹配，也就是浏览器常见的复选框一个横线的时候的那种状态。该伪类也可以用于单选框，当单选框的组没有一个选中的时候则单选框的每一项都匹配。

`:valid`：输入验证有效的时候匹配。`:invalid`：输入严重无效的时候匹配。就是我们在`<input>`标签中设置required或者pattern等属性的时候，会判断是否有效，匹配对应的伪类。由于首次进来的时候往往没有输入内容，这时如果有required属性，此时`:invalid`会匹配，这样就有点不太友好了，更好的伪元素就是`:user-invalid`，可以避免首次判断，但是目前兼容性非常不好。

范围验证伪类`:in-range`和`:out-of-range`使用于type=number和type=range的input标签。

`:required`表示表单必填，`:optional`表示表单可选（非必填）。

### 树结构伪类 ###

`:root`匹配根元素，IE9以上才支持，在XHTML中根元素就是html，另外也可以匹配的SVG的根元素，但不能匹配Shadow DOM的的根元素，Shadow DOM的的根元素是`:host`。`:root`最常用的是声明CSS变量。

`:empty`用来匹配空元素，这里的空元素包括前后闭合的空元素，甚至`<input>`这种非闭合的标签。如果标签内有空格、换行、注释则不能匹配`:empty`。具有`::before`或者`::after`的空元素可以匹配`:empty`。

`:first-child`第一个子元素；`:last-child`最后一个子元素；`:only-child`唯一的子元素。

`:nth-child()`与`:nth-last-child()`表示第几个子元素和倒数第几个子元素，从1开始，也可以是`odd`（基数）和`even`（偶数），也可以An+B这种形式，如`:nth-child(3n + 4)`匹配第4、7、10...

`:first-of-type`当前类型元素的第一个；`:last-of-type`当前类型元素最后一个；`:only-of-type`当前类型只有一个。`:only-child`匹配到的元素一定是`:only-of-type`，但是反之不成立。`:nth-of-type()`和`:nth-last-of-type()`与上面的类似，不再重复。

### 逻辑组合伪类 ###

否定伪类`:not()`：如果当前元素与括号里面的选择器不匹配，则`:not()`后会匹配。需要注意的是`:not()`括号里面的只能出现一个选择器，如`:not(p)`，不可以`:not(p.class1)`或者`:not(p, div)`，可以写多个`:not()`来支持这种情况如：`:not(p):not(class1)`。另外`:not()`本身的优先级权重是0，整体权重则由括号内的权重来决定。

与`:not()`相反的伪类是`:is()`，`:is()`是老版本浏览器的`:matches()`和`:any()`演化来的。`:is()`的权重与`:not()`一样由括号内的权重来决定。还有一个伪类`:where()`匹配规则与`:is()`相同，但是整体权重是0，不管括号内的权重是多少。

### 其他伪类选择器 ###

`:scope`作用域选择伪类，由于CSS只有一个全局作用域，所以`:scope`与`:root`一样，都相当于`html`。不过JS倒是支持的，详见上面`精通CSS选择符`最后部分。

`:fullscreen`用来匹配全屏状态下的DOM元素（调用dom.requestFullScreen()方法的dom元素），`:backdrop`伪元素用来匹配浏览器默认的黑色全屏背景元素的。

`:dir(ltr|rtl)`匹配从左到右，还是从右到左。

`:lang()`语言类伪类，如`:lang(zh)`。

video或者audio播放状态伪类`:playing`和`:paused`。
