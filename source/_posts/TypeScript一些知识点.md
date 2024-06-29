---
title: TypeScript一些知识点
date: 2024-05-12 14:56:37
author: Orange
tags:
  - TypeScript
categories: JavaScript
---

## 区域注释 ##

TypeScript 可以添加区域注释，可以让VS Code等编辑器识别为一个代码区域，区域注释使用的是单行注释语法：

```TypeScript
//#region 区域描述
let x = 0;
let y = x + 1;
//#endregion
```

## 运算符 ##

### 空值合并运算符 ###

```TypeScript
a ?? b
```

如上，当 `a` 为 `undefined` 或 `null` 的时候，返回 `b` 。相比于 `a || b` ，当 `a` 为 `false` 或空字符串时，`a ?? b` 也返回a，这在某些对于 `false` 或空字符串也起作用的场景，空值合并运算符是非常有用的。

## TypeScript的原始类型 ##

TypeScript常见原始类型有：

+ boolean
+ string
+ number
+ bigint
+ symbol
+ undefined
+ null
+ void
+ 枚举类型
+ 字面量类型

这里的原始类型都是小写的，如下：

```TypeScript
const a: bigint = 1n;
const b: number = 1n; // 报错，因为bigint不能算作number类型
```

### symbol ###

symbol对应JavaScript原始类型的Symbol。考虑如下代码：

```TypeScript
let s1: symbol = Symbol();
s1 = Symbol();

interface A {
  [s1]: number; // 报错
}

const a: A = {
  [s1]: 123,
}
```

`Symbol` 表示不变的，但是上述 `symbol` 类型的 `s1` 却可以再次赋值为其他 `Symbol` 值，这就导致在定义接口 `A` 的时候使用的 `s1` 可以变化，这就违背了 `Symbol` 不变的性质。为了避免这种问题，TS引入了 `unique symbol` 类型，该类型的 `Symbol` 必须用 `const` 申明（ `let` 或 `var` 声明直接报错），这样就不能再修改了：

```TypeScript
const s1: unique symbol = Symbol();

interface A {
  [s1]: number; // OK
}

const a: A = {
  [s1]: 123,
}
```

`unique symbol` 只能通过 `Symbol()` 或者 `Symbol.for()` 赋值，但`symbol`类型没有这样的限制。

```TypeScript
const s1: unique symbol = Symbol();
const s2: unique symbol = s1; // 报错
const s3: symbol = s1; // OK
```

### 枚举类型 ###

TS中的枚举实际上会编译为对象：

```TypeScript
enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

// 实际编译为：
var Direction;
(function (Direction) {
  Direction[Direction["UP"] = 0] = "UP";
  Direction[Direction["DOWN"] = 1] = "DOWN";
  Direction[Direction["LEFT"] = 2] = "LEFT";
  Direction[Direction["RIGHT"] = 3] = "RIGHT";
})(Direction || (Direction = {}));
```

可以看出枚举实际上是编译为对象，而且值实际上是数值，如上面 `Direction.UP === 0` 。当然因为这里也对数值赋值为对应的字符串，所以 `Direction[0] === 'UP'` 。

这里也可以给某个枚举值赋值为数字，这样枚举值的计数就会从赋值开始：

```TypeScript
enum Direction {
  UP = -2,
  DOWN,
  LEFT = 10,
  RIGHT,
}

// 实际编译为：
var Direction;
(function (Direction) {
  Direction[Direction["UP"] = -2] = "UP";
  Direction[Direction["DOWN"] = -1] = "DOWN";
  Direction[Direction["LEFT"] = 10] = "LEFT";
  Direction[Direction["RIGHT"] = 11] = "RIGHT";
})(Direction || (Direction = {}));
```

可以看到 `UP` 是 `-2` ，`DOWN` 是 `-2 + 1` 也就是 `-1` ；`LEFT` 是 `10`，`RIGHT` 是 `10 + 1` 也就是 `11`。

当然枚举也可以是字符串：

```TypeScript
enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

const up: Direction = Direction.UP;
const down: Direction = 'DOWN'; // 报错，虽然值相同 但是字符串不能赋值给枚举

// 上述枚举编译为：
var Direction;
(function (Direction) {
  Direction["UP"] = "UP";
  Direction["DOWN"] = "DOWN";
  Direction["LEFT"] = "LEFT";
  Direction["RIGHT"] = "RIGHT";
})(Direction || (Direction = {}));
```

`const 枚举` 指的是用 `const` 声明的枚举，`const 枚举` 编译跟普通枚举不同，它编译后的结果是在使用的地方直接替换为对应的字符串或数字：

```TypeScript
const enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

const up: Direction = Direction.UP;

// 上述枚举编译为：
const up = 0 /* Direction.UP */; // 在使用的地方直接转化为对应的枚举值
```

## strictNullChecks ##

当给一个类型的值设置为 `null` 或者 `undefined` 的时候默认并不会报错：

```TypeScript
const s: string = undefined; // OK
const b: boolean = null; // OK
const n: null = undefined; // OK
const undef: undefined = null; // OK
const a: any = null; // OK
const unk: unknown = undefined; // OK
```

但是可以通过配置 `--strictNullChecks` 来严格检查是否为空，配置方式有两种：

1. 运行命令 `tsc index.ts --strictNullChecks false`
2. 在tsconfig.json中添加：

```JSON
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

> 注：大多数配置参数都是通过上述两种方式配置的, 但一般使用TS时需要编辑器直接告诉我们哪里编码错误，而不是等编译的时候再检查，所以这里更推荐第二种方式。更多配置请[参考这里](https://www.typescriptlang.org/tsconfig/)。

配置以后上面的情况如下：

```TypeScript
const s: string = undefined; // Error
const b: boolean = null; // Error
const n: null = undefined; // Error
const undef: undefined = null; // Error
const a: any = null; // OK
const unk: unknown = undefined; // OK
```

> 注: `any` 和 `unknown` 仍然可以设置为 `null` 和 `undefined`。

## 顶端类型 ##

顶端类型是一种通用类型，有时也称为通用超类型。在类型系统中，所有类型都是顶端类型的子类。
TypeScript中有两种顶端类型：

1. any
2. unknown

`any` 类型允许执行任意操作而不会产生编译错误（但运行时候也可能出现错误），通常用于跳过类型检查：

```TypeScript
const a: any = 0;
a.length; // 编译时不会报错
a(); // 编译时不会报错
a[0]; // 编译时不会报错
```

对于一个方法来说如果没有声明类型则默认是`any`类型，可以通过 `--noImplicitAny` 参数来控制不允许隐式设置any类型。

```TypeScript
// --noImplicitAny: false
function f(x) {} // OK x类型隐式设置为any


// --noImplicitAny: true
function f(x) {} // Error

// --noImplicitAny: true
function f(x: any) {} // OK x类型显示设置为any
```

`--noImplicitAny` 的配置方法跟上面 `--strictNullChecks` 配置方法类似，如修改 `tsconfig.json` 文件：

```JSON
{
  "compilerOptions": {
    "noImplicitAny": true
  }
}
```

`unknown` 与 `any` 类型任何其他类型都可以赋值给 `unknown` ，但是`unknown`类型的值只能赋值给 `unkonwn` 和 `any`，而且 `unknown` 不允许执行绝大多数的操作：

```TypeScript
let a: unknown = 0;
let b: number = 0;
a = b; // OK
a.length; // Error 不像any可以执行任何操作

let c: number = a; // Error unknown只能赋值给 any 和 unknown
let d: any = a; // OK
```

通常使用 `unknown` 需要自行判断类型：

```TypeScript
function (x: unknown) {
  if(typeof x === 'string') {
    return x.length; // 判断了类型是 string 的时候调用 x.length 才不会报错
  }
}
```

## 尾端类型 ##

尾端类型是所有类型的子类型，它只有一个类型就是 `never` ，该类型甚至没有值。由于它是所有类型的子类型，所以它可以赋值给任何类型，但是其他类型都不能赋值给它，包括 `any`。

```TypeScript
let a: never; // OK
let b: boolean = a; // OK 它可以赋值给任何类型
let c: any = 1;
a = c; // Error 其他类型不能赋值给它
a = 1; // Error never没有值
let d: never = undefined; // Error never没有值 显示设置undefined也不行
```

> 注：虽然 `never` 可以赋值给任何类型，但是如果在 `--strictNullChecks` 为`true`的时候，同样会报错。如上第二行，在 `--strictNullChecks` 为 `true` 时，也是会报错的。

`neber` 的使用场景：

1. 函数没有返回值。

```TypeScript
function fn(): never {
  throw new Error()
}
```

2. 函数死循环。

```TypeScript
function fn(): never {
  while(true) {

  }
}
```

3. 有些条件类型判断中会使用到never。

```TypeScript
type Exclude<T, U> = T extends U ? never : T;

type T = Exclude<boolean | string, string>; // type T = boolean
```

## 只读数组 ##

数组的表示方法：

```TypeScript
const a: number[] = [1, 2, 3];
const b: Array<number> = [1, 2, 3];

const c: number = a[100]; // OK虽然 a[100] 的值是undefined但是这里可以用number来声明 因为a是number的数组
```

只读数组的表示方法：

```TypeScript
const a: ReadonlyArray<number> = [1, 2, 3];
const b: readonly number[] = [1, 2, 3];
const c: Readonly<number[]> = [1, 2, 3];

const d: readonly Array<number> = [1, 2, 3]; // Error readonly不能与泛型数组一起使用

a.push(4); // Error 只读数组不能追加
```

## 元组类型 ##

元组类型是数组类型的子类型，值是一个数组。元组一般是长度固定的数组，相比较数组每个元素都是相同的类型，元组每个元素的类型都可以不同。由于元组类型是数组的子类型所以元组类型可以赋值给数组类型，前提是元组中的每一项都符合数组的每一项类型；数组类型是不能赋值给元组类型的。

```TypeScript
const a: [number, string] = [1, '2']; // a就是元组类型
a[3]; // Error 只有2个元素的元组不能访问长度3

const b: readonly [number, string] = [1, '2']; // 只读元组
const c: Readonly<[number, string]> = [1, '2']; // 只读元组

let d: [number, string?, boolean?] = [1, '2', true]; // 可选元组
d = [2]; // OK
d = [2, '3']; // OK
d = [2, '3', false]; // OK
d = [2, false]; // Error 可选只能省略后面的 不能省略中间的 第二个可选参数是string

let e: [number, ...string[]] = [1, '2']; // 带有剩余参数的元组
e = [1, '2', '3', '4']; // OK

const f: [number, string] = [1, '2'];
const g: [number, number] = [1, 1];
const h: number[] = f; // Error
const i: number[] = g; // OK
const j: number[] = [1, 2];
const k: [number, number] = j; // Error 数组类型不能直接赋值给元组 因为可能数组的个数比元组少
```

## 对象类型 ##

### Object ###

在TypeScript中值 `Object`（window.Object）的类型并不是 `Object` 类型，而是 `ObjectConstructor` 类型。通过调用`new Object()`获取到的值的类型才是`Object`类型。

```TypeScript
interface Object {
  constructor: Function;
  toString(): string;
  valueOf(): Object;
  // ...
}
interface ObjectConstructor {
  readonly prototype: Object;
  // ...
}
declare var Object: ObjectConstructor;
```

`Object` 类型的值除了 `null` 和 `undefined` 外，其他任何值都可以赋值。为什么相如 `boolean` 这种原始数据类型也能赋值给 `Object` 呢？因为原始类型会自动拆箱和装箱啊。但是声明的 `Object` 类型的值不能调用 `window.Object` 以外定义的属性和方法。

```TypeScript
const a: Object = new Object(); // OK
const b: Object = { // 可以定义 Object 类型
  x: 123
}; // OK
b.x; // Error 但不能访问Object外定义的属性和方法
c.toString(); // OK 返回 'true'

const c: Object = true; // OK
const d: Object = null; // Error
const e: Object = []; // OK
const f: Object = function f() {}; // OK
const g: Object = new Date(); // OK
```

### object ###

`object` 相比较于 `Object` 更加严格，只能是对象类型，而不能是 `boolean` 这样的原始数据类型，同样的也只能调用 `Object` 类型定义的属性和方法。

```TypeScript
const a: object = new Object(); // OK
const b: object = {
  x: 123
}; // OK
b.x; // Error 不能访问Object外定义的属性和方法
a.toString(); // OK
const c: object = true; // Error
const d: object = null; // Error
const e: object = []; // OK
const f: object = function f() {}; // OK
const g: object = new Date(); // OK
```

### 对象字面量类型 ###

一看就会的对象字面量类型：

```TypeScript
const a: { x: number, y: number} = {
  x: 0,
  y:0
};
```

上面类型 `{ x: number, y: number}` 就是对象字面量类型，是不是很简单？看一个稍微复杂一点的例子：

```TypeScript
const a: 'a' = 'a'; // 注意这里的类型使用了 'a' 而不是string, 如果是string则不能用在对象中作为属性
const b: unique symbol = Symbol();
let obj: {
  [a]: boolean; // OK 可计算属性名 只能是string字面量、number字面量、symbol
  [b]: string; // OK 使用symbol
  c?: string; // OK 拥有可选属性c
  readonly d: number; // OK 拥有只读属性
} = {
  [a]: true,
  [b]: '0',
  d: 1,
  e: 123, // Error 没有定义这个类型的属性
};
```

上面 `obj.e` 由于没有出现在类型定义中所以报错了，可以通过如下方式添加多余参数的定义：

```TypeScript
let obj: {
  a: boolean;
  [prop: string]: any;
};

obj = {
  a: true,
  e: 123, // OK
};
```

上面 `[prop: string]: any` 表面属性值可以是任何类型的，所以不会报错，想想上面的 `obj.a` ，其中 `a` 相当于也是一个 `string` 类型，如果修改为`[prop: string]: string`，而 `a` 的类型是 `boolean` ，那么就会存在 `boolean` 和 `string` 冲突，所以就会报错。

## 函数类型 ##

函数的参数可以是剩余参数，剩余参数类型可以是数组或元组：

```TypeScript
// 剩余参数是数组
function f(...args: number[]) {}

// 剩余参数是元组
function f(...args: [boolean, number]) {}
// 等价于
function f(args_0: boolean, args_1: number) {}

// 剩余参数是元组，且有可选值
function f(...args: [boolean, number?]) {}
// 等价于
function f(args_0: boolean, args_1?: number) {}
```

通常在定义函数就已经确定好函数的类型了，但是你也可以给一个变量设置为函数的类型，这里有两种方式：

```TypeScript
// 函数的调用签名定义：
{ (ParameterList): Type }
// 简写为：
(ParameterList) => Type

// 如：
let f: { (x: number): void };
// 等价于
let f: (x: number) => void;
```

**类本质上是函数**，类的签名可以用构造函数来表示，格式如下：

```TypeScript
// 类的构造签名定义
{ new (ParameterList): Type }
// 简写是
new (ParameterList) => Type


// 如：
let C: { new (name: string): Object };

// 等价于：let C: new (name: string) => Object;

C = class {
  private name: string;
  constructor(name: string) {
    this.name = name;
  }
}

let c = new C('name');
```

构造签名和调用签名可以共存，如下：

```TypeScript
type Str = {
  new (name: string): String,
  (name: string): string
};

const s: Str = String;

let a = new s('name1');
let b = s('name2');
```

上述类型 `Str` 可以通过 `new` 来创建 `String` 对象，也可以通过函数调用返回 `string` 类型；实际上 `String` 函数就属于这种类型。

### 函数重载 ###

函数重载是指一个函数有多个同名的函数签名，如下：

```TypeScript
function add(x: number, y: number): number;
function add(x: string, y: string): string;
function add(x: number | string, y: number | string) : number | string {
  if(typeof x === 'number' && typeof y === 'number') {
    return x + y;
  } else if(typeof x === 'string' && typeof y === 'string') {
    return x + y;
  } else {
    throw TypeError('类型不符');
  }
}

add('1', 2); // 报错 函数允许x和y都是nunber或者都是string
```

不带有函数体的函数声明语句叫做函数重载，它只提供函数的类型信息。重载函数由一条或多条函数重载语句以及一条函数实现语句构成。只有一条重载语句跟函数签名是对应的函数重载，是允许的，但通常没啥意义（一条的时候函数重载可以省略）。对于多条函数重载来说，每个函数重载中的函数名和函数实现中的函数名必须一致。同时函数重载语句与其他函数重载语句或函数实现语句之间不能出现其他语句，否则将产生编译错误。函数重载语句在函数编译后将会删除。在上述例子中，如果没有函数重载，只看函数实现则可以出现`x`是`nunber`，`y`是`string`这种情况，但是函数重载限制了这种情况。需要注意的是函数实现必须兼容所有的重载语句。

函数重载也可以通过对象字面量来表示，如下：

```TypeScript
const add: {
  (x: number, y: number): number;
  (x: string, y: string): string;
} = function add(x: any, y: any) : any {
  if(typeof x === 'number' && typeof y === 'number') {
    return x + y;
  } else if(typeof x === 'string' && typeof y === 'string') {
    return x + y;
  } else {
    throw TypeError('类型不符');
  }
}

add('1', 2); // 报错 函数允许x和y都是nunber或者都是string
```

需要注意的是函数字面量相当于是先定义了add的类型，然后再给实现，所以实现的参数和返回类型一定要满足定义中的所有情况，上述实现中`x`使用了`any`类型，如果是`number | string`，则不符合定义函数中的任意一项，所以也会报错。

### 函数重载解析顺序 ###

当一个函数的实际参数数量不少于函数重载中的必须参数且不多于重载函数中定义的所以参数数量，同时实际参数的类型能够匹配函数重载中的参数，则认为这条函数重载符合函数定义，如果有多条符合的则从上到下解析。如下

```TypeScript
function f(x: any): string;
function f(x: string): 0;
function f(x: any): any {
  if(typeof x === 'string') {
    return 0;
  } else {
    return '1';
  }
}

const a: 0 = f('h1'); // 报错a的类型应该是string
```

上述第一条函数重载和第二条函数重载都满足函数调用的参数，根据从上倒下应该选中第一条函数重载，该函数重载返回的是`string`类型，而不是`0`，所以报错。因此，一般写函数重载的时候我们应先定义范围更小的函数重载。

### 函数中的this类型 ###

通常我们在函数中使用 `this` 是不会报错的，但是如果 `--noImplicitThis=true` 的时候，则会报错。

```TypeScript
function foo(bar: string) {
  this.bar = bar; // --noImplicitThis=true的时候报错
}
```

可以在函数定义的时候第一个参数定义 `this` 的类型，但调用的时候需要调用`call`，`bind`，`apply`等来调用。

```TypeScript
function foo(this: { bar: string }, bar: string): any {
  this.bar = bar;
}

/** 上述编译后相当于是：
 * function foo(bar) {
 *     this.bar = bar;
 * }
 **/

foo('123'); // 报错 没有显示传this默认是void，与函数定义的类型不符

foo.call({ bar: '' }, '123'); // OK

foo.bind({ bar: '' })('123'); // OK

foo.apply({ bar: '' }, ['123']); // OK

new foo('123'); // 报错 Ts建议 通过class来创建对象

new (foo as any)('123'); // OK
```

## 接口 ##

接口可以定义任意对象类型，但无法表示原始类型。接口类型的成员可以是**属性签名**、**调用签名**、**构造签名**、**方法签名**和**索引签名**。另外接口可以多继承。通过一个例子看接口的各种用法：

```TypeScript
interface TestInterface {
  x: number; // 属性签名
  (message?:string): Error; // 调用签名
  new (message?:string): Error; // 构造签名
  getElementById(elementId: string): HTMLElement | null; // 方法签名
  [props: string]: any; // 索引签名

  y?: string; // 可选参数
  z?(): number; // 可选参数是方法
  readonly a: number; // 只读属性
}

interface TestInterface2 {
  b: number;
}

// 多继承
interface TestInterface3 extends TestInterface, TestInterface2 {
  c: number;
}

// 练习 数组也是对象 那么可以用接口定义数组
interface StringArray {
  [props: number]: string;
}

const arr: StringArray = ['1', '2', '3']; //OK
```

## 类型别名 ##

类型别名相当于给已有类型起了一个别名，它不会创建类型，但是可以给任意类型起别名。

```TypeScript
type DecimalDigit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const d: DecimalDigit = 0;
```

类型别名与接口的比较：

1. 类型别名能够表示非对象类型，而接口不行。
2. 接口可以继承其他接口、类等对象类型。而类型别名不能继承（但可以通过交叉类型 `&` 来实现类似的功能）；
3. 错误提醒对类型别名引用对应的类型，而接口引用接口名。
4. 接口可以同名，同名接口对应的值会合并，但是类型别名不能同名。

## 类 ##

TypeScript的类与JavaScript的类大多数语法都是类似的，但TypeScript对类的一下功能做了扩充，如接口实现、泛型类等。一个简单的示例：

```TypeScript
interface IA {
  a: number;
}

class A implements IA { // 可以继承接口
  a: number = 0; // 定义一个属性a
  readonly b: number = 1; // 定义一个只读属性b 只读属性必须赋初始值
  readonly c: number; // 只读属性初始值在构造函数中赋值 如果不赋值则报错
  private _d: number = 3;
  static e: string = '4'; //静态属性

  constructor() { // 构造函数不能定义返回类型
    this.c = 2;
  }

  say(): void { // 成员方法
    console.log('Hello');
  }

  get d(): number { // getter
    return this._d;
  }

  set d(value) { // setter
    this._d = value;
  }
}


class B extends A { // 继承
  f: string = '5'; // 子类特有的属性
}
```

### 类的可访问性 ###

访问修饰符：

> `public`(默认): 当前类的内部、外部以及派生类的内部均可访问，不写访问修饰符默认就是`public`。
> `protected`: 在当前类和派生类内部可以访问，不允许当前类外部（如创建的对象）访问。
> `private`: 只有当前类的内部可以访问。

ES13类的私有字段TS也是支持的，私有字段仅有类内部可以访问：

```TypeScript
class A {
  #b: number;

  constructor() {
    this.#b = 1; // 内部可以访问
  }
}

const a = new A();
a.#b; // Error 不能访问
```

### 参数成员 ###

在类的构造函数的参数中使用**访问修饰符或readonly**修饰，则该参数自动成为类的成员变量，不需要在构造函数中使用 `this.a = a;` 这样的语句。

```TypeScript
class A {

  constructor(
    public b: number,
    protected c: number,
    private d: number,
    readonly e: number,
  ) {
    console.log(this.b, this.c, this.d, this.e);
  }
}

const a = new A(1, 2, 3, 4); // 打印1, 2, 3, 4
a.b; // 返回1
```
