---
title: 一文看懂TypeScript工具类型
date: 2024-06-29 16:16:12
author: Orange
tags:
  - TypeScript
categories: JavaScript
---

`TypeScript` 的工具类型，也被称作类型体操。通过本文你就知道这些工具类型的原理，并可以自己写出一些工具类型。在学习工具类型之前，我们先学学工具类型所用到的基础知识，当基础知识掌握牢固后，看懂工具类型自然水到渠成。

## 基础知识 ##

### 泛型 ###

我们先看一个泛型的例子：

```TypeScript
function identity<T>(arg: T): T {
  return arg;
}

const a = identity<string>('foo');
const b = identity<boolean>(true);
const c = identity<string>(true); // Error 类型不匹配
const d = identity(true); // OK 类型推断T为字面量类型true
```

这个例子很简单，`identity` 函数接受一个名称为 `T` 泛型（名称可以随便写），函数参数的类型也是泛型 `T` ，返回值也是 `T`。在调用函数的时候，根据具体的使用场景来决定参数的类型，这就是泛型的作用。如果类型不匹配的话就会报错。

在泛型类型声明的时候泛型可以是多个，可以给默认值，有默认值的泛型参数是可选泛型参数，可选泛型参数需要放在泛型定义的后端。

```TypeScript
function f1 <T = boolean, U>() {} // 错误 可选泛型应该放在后端
function f2<T, U = boolean>() {} // 正确

function f3<T = U, U = boolean>() {} // 错误 给T设默认值U的时候 由于U在T后面定义 此时还未定义
function f4<T = boolean, U = T>() {} // 正确 U的默认值是T也就是boolean
```

### 泛型约束 ###

泛型约束是在泛型的类型参数上定义一个约束条件，从而限制了泛型实际类型的最大范围，这个类型参数的约束条件就是泛型约束，语法采用了 `extends` 关键字，类似于类的继承。泛型约束是工具类型的核心。

```TypeScript
interface Points {
  x: number;
  y: number;
}
function identity<T extends Points>(arg: T): T {
  return arg;
}

identity({x: 0, y: 0}); // OK
identity({x: 0, y: 0, z: 0}); // OK
identity({x: 0}); // Error 不满足约束条件 缺少y字段

function f<T extends boolean>() {}
f<true>(); // OK
f<false>(); // OK
f<string>(); // Error 类型不满足约束条件
```

约束条件有点特殊，它可以引用泛型列表中的其他类型，但是不能循环引用。

```TypeScript
function f1 <T extends U, U>() {} // OK 注意约束条件可以引用列表中的其他类型 哪怕前面的都可以引用后面的
function f2<T, U extends T>() {} // OK

function f3 <T extends T>() {} // Error 循环引用
function f4<T extends U, U extends T>() {} // Error 循环引用
```

### 泛型类型别名 ###

泛型除了用在函数上还可以用在类和类型别名上。在工具类型中，泛型大量应用与类型别名上，看两个例子：

```TypeScript
type Nullable<T> = T | undefined | null;
type Container<T> = { value: T };

const a: Nullable<string> = '123'; // a的类型是 string  | undefined | null
const b: Container<boolean> = { // b的类型是 { value: boolean }
  value: true,
};
```

### 联合类型 ###

联合类型就是类型用 `|` 操作符连起来的类型。联合类型赋值的时候是相联合类型的综合。子类型与父类型联合的结果是父类型，任何类型与`never`联合是任何类型。**对于类、接口等对象的联合，可赋的值是其中任意一个，但访问只能访问所有类型的共有属性和方法。**。从感觉上来看非对象联合范围可能变大了，但是对象的联合范围反而变小了。之所以这么做，是因为联合类型的对象在任何特定时刻只能符合其中的一个类型，因此 TypeScript 需要一种方法来确保你访问的属性在所有可能的类型中都是存在的。当然如果你通过类型判断推断出是具体的某个类型则可以调用对应的非共有方法。

```TypeScript
// 基本类型的联合
type T1 = number | string; // 既可以是数字也可以是字符串
const a: T1 = 1; // OK
const b: T1 = '1'; // OK

// 对象类型的联合
interface IA {
  a: number;
  b: number;
}

interface IB {
  b: string;
  c: number;
}

type T2 = IA | IB;

const c: T2 = {
  a: 1, // OK a属于IA上的属性
  b: 2, // OK b可以是string 也可以是number
  c: 3, // OK c属于IB上的属性 这里b=2是number的子类型 TS没推断出c:IA 所以这里没报错
  d: 4, // Error d不在IA也不在IB
}

console.log(c.a); // Error 不能访问非共有属性
console.log(c.b); // OK
console.log(c.c); // Error 不能访问非共有属性

type T3 = string | 'a'; // string 子类型于父类型联合是父类型

type T4 = string | never; // string 任何类型和never联合是任何类型 这个可以非常重要的哦

type T5 = { kind: 'T5', a: number };
type T6 = { kind: 'T6', b: string };
type T7 = T5 | T6;

const d: T7 = {
  kind: 'T5', // OK 可以判断是T5
  a: 123, // OK
  b: '123', // Error kind自变量可以推断出g是IE类型所以不能有b属性
}

function handle(d: T7) {
  if (d.kind === 'T5') {
    console.log(d.a); // `g` 确定是 `IE` 类型，访问 `a` 是安全的
  } else if (d.kind === 'T6') {
    console.log(c.b); // `g` 确定是 `IF` 类型，访问 `b` 是安全的
  }
}
```

### 交叉类型 ###

交叉类型就是类型用 `&` 操作符连起来的类型。子类型与父类型交叉的结果是子类型。对于没有交集类型的交叉则是 `never` 。对象类型的交叉是属性的综合。**`never` 、`null` 和 `undefined` 与其他类型交叉的结果是 `never` ，空对象类型与其他非`never`、`null`和`undefined`的类型交叉是其他类型**。

```TypeScript
type T1 = boolean & true; // true
type T2 = boolean & true & false; // never 因为true和false没有交集
type T3 = boolean & boolean & boolean; // boolean

interface IA {
  a: boolean;
}

interface IB {
  b: boolean;
}

type T4 = IA & IB;

// T4 相当于
// interface T4 {
//   a: boolean;
//   b: boolean;
// }

type T5 = string & null; // never
type T6 = any & never; // never
type T7 = string & {}; // string 空对象与非null/undefined/never类型交叉是对应的类型
```

如果交叉的两个属性相同，那么他们的属性类型也是每个属性交叉的结果，看一个稍微复杂的例子：

```TypeScript
interface IA {
  x: {a: string, b: string};
}

interface IB {
  x: {b: number, c: number};
}

type T1 = IA & IB;

// 相当于：
// type T1 = {
//   x: {a: string, b: string} & {b: number, c: number}
// }

// 相当于：
// type T1 = {
//   x: {a: string, b: string & number, c: number }
// }

// 相当于：
// type T1 = {
//   x: {a: string, b: never, c: number }
// }
```

### 分配率 ###

交叉类似于数学中的乘法，联合类似于数据中的加法，所有交叉的优先级比联合优先级高，同时满足分配率。

```TypeScript
A & B | C & D = (A & B) | (C & D)

A & ( B | C ) = (A & B) | (A & C)

(A | B) & (C | D) = A & C | A & D | B & C | B & D

// 有了这些知识我们就知道更复杂的类型判断了，如：
type T = (string | 0) & (number | 'a');
       = (string & number) | (string & 'a') | (0 & number) | (0 & a);
       = never | 'a' | 0 | never;
       = 'a' | 0;

```

### 索引类型查询 ###

通过索引类型查询（使用 `keyof` 关键字）能够获取给定类型中的属性名类型。索引类型查询的结果是由字符串字面量类型构成的联合类型。

```TypeScript
interface T {
  x: number;
  y: number;
  z: number;
}

type T1 = keyof T; // 'x' | 'y' | 'z'
```

在JS中对象的键只能是字符串、数字和Symbol，所以 `keyof` 的结果必定是联合类型 `number | string | symbol` 的子类型。`keyof` 通常返回的是键的名称的联合类型，但有些情况比较特殊：

1. 属性中只有字符串索引签名（属性类型是`[props: string]: any`），返回`number | string`的联合类型；
2. 属性中只有数值索引签名（属性类型是`[props: number]: any`），返回`number`类型；
3. 属性中只包含`unique symbol`属性，返回的是对应的`unique symbol`类型；
4. 有其他属性成员的，返回的是成员属性名的联合类型（这条重要）；
5. `any` 返回的是`number | string | symbol`联合类型（通常用来做键的约束）；
6. `unknown` 返回`never`;
7. 原始类型返回对应对象上的属性或方法名；
8. 联合类型返回公共属性名（这条重要）；
9. 交叉类型返回所有属性名（这条重要）。

```TypeScript
interface I1 {
  [props: string]: string;
}
type T1 = keyof I1; // string | number

interface I2 {
  [props: number]: string;
}
type T2 = keyof I2; // number

const s: unique symbol = Symbol();
interface I3 {
  [s]: string;
}
type T3 = keyof I3; // typeof s

interface I4 {
  0: boolean;
  a: string;
  b(): string;
  [s]: string;
}
type T4 = keyof I4; // 0 | 'a' | 'b' | s

type T5 = keyof any; // string | number | symbol

type T6 = keyof unknown; // never

type T7 = keyof boolean; // 'valueOf'

type T8 = keyof string; // number | typeof Symbol.iterator | "toString" |  ...等string上的方法

type T9 = keyof number; // 'toString' | 'toFixed' | 'toExponential' | 'toPrecision' | 'valueOf' | 'toLocaleString'

type A = {a: number, b: number};
type B = {b: string, c: string};

type T10 = keyof (A | B); // 'b' 注意 keyof 的优先级比 | 和 & 高，所以这里要上括号

type T11 = keyof (A & B); // 'a' | 'b' | 'c'

keyof (A & B) = keyof A | keyof B; // keyof 也满足分配率
```

### 索引访问类型 ###

对象值的类型可以想对象一样获取：

```TypeScript
type T1 = {x: '1', [props: string]: string};
type T2 = 'x';
type T3 = T1[T2]; // '1'
type T4 = T1['y']; // string
```

### 映射对象类型 ###

映射对象类型可以把已有对象类型映射为新的对象类型，映射对应类型使用 `in` 关键字，语法定义如下，其中 `readonly` 和 `?` 是可选的。

```TypeScript
{ readonly [P in K] ?: T }
```

看看例子：

```TypeScript
type T1 = { [P in 0 | 1] ?: string };
// 相当于
// type T1 = {
//     0?: string | undefined;
//     1?: string | undefined;
// }

type T2 = { [P in 'a'] : string };
// 相当于
// type T2 = {
//     a: string;
// }
type T3 = { [P in string] : string };
// 相当于
// type T3 = {
//     [x: string]: string;
// }
type T4 = { [P in number] : string };
// 相当于
// type T4 = {
//     [x: number]: string;
// }

type T5 = { a: string, b: number };
type T6 = { [P in keyof T5]: T5[P] }; // 这里先用 keyof T5 获取到 'a' | 'b' 再使用映射对象类型
// 相当于
// type T6 = {
//     a: string;
//     b: number;
// }
```

### Partial 与 Readonly ###

本文讲的是TS的工具类型，到目前为止我们还没有讲工具类型，现在我们看看第一个工具类型 `Partial<T>` 。`Partial<T>` 的作用是把对象类型的所有属性设置为可选的，可以使用映射对象类型来实现：

```TypeScript
// 使用：
type T = {a: string, b: number};
type PartialT = Partial<T>; // {a?: string | undefined, b?: number | undefined}

// 原理：通过索引访问类型添加?即可。

// 实现：
type Partial<T> = {
  [P in keyof T]?: T[P] | undefined;
}
```

同样的 `Readonly<T>` 也跟 `Partial<T>` 的实现方式类似，`Readonly<T>` 是给每一个属性加一个 `readonly`：

```TypeScript
// 使用：
type T = {a: string, b: number};
type ReadonlyT = Readonly<T>; // {readonly a: string, readonly b: number }

// 原理：与Partial类似只是添加的是 readonly

// 实现：
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
}
```

### 同态映射对象类型 ###

我们对象类型中存在索引类型查询（即 `keyof`），这种映射就是同态映射，如果对象类型中没有索引类型查询就认为是非同态映射。同态映射会把原来对象的 `readonle`和 `?` 一并映射过来，所以是`同态`。

```TypeScript
type T = {a?: string; readonly b: number};
type KT = keyof T; // KT是在MOT外面定义的 所以就是非同态
// 同态映射
type HMOT = { [P in keyof T]: T[P]}; // { a?: string; readonly b: number;}
// 非同态映射
type MOT = { [P in KT]: T[P]}; // { a: string | undefined; b: number; }
```

> 注：非同态映射对于可选参数来说，类型是与 `undefined` 的联合类型。

同态映射对象类型只能保证映射的对象跟原有 `readonle` 和 `?` 对象操作符相同，当然可以自己写一个 `readonle` 或 `?` 覆盖调原来的操作符，但是不能随意控制减少。实际上在 `readonle` 和 `?` 前可以添加 `+` 和 `-` 来更精细化的控制。当然 `+readonle` 和 `readonle` 的效果实际上是一样的，所以 `+` 一般是省略的。

现在我们实现一下 `Required<T>`， 该工具类的作用就是去掉键值对中间的 `?`。

```TypeScript
// 使用：
type T = {
  a?: string | undefined | null;
  readonly b : number | null | undefined;
}

type RequiredT = Required<T>;
// 相当于：
// type RequiredT = {
//     a: string | null;
//     readonly b: number | null | undefined;
// }

// 原来：与Partial类似，通过-号去掉?号

// 实现：
type Required<T> = { [P in keyof T]-?: T[P]; }; // 注意问好前目的-号
```

注：`?` 前加 `-` 的时候，只对带有 `?` 的属性生效，且去掉 `undefined` 类型。对于没有 `?` 修饰的属性，不去掉`undefined` 类型。

映射也可以用在非对象类型:

```TypeScript
type HMOT<T, X> = { [P in keyof T]: X};
type Type1 = HMOT<string, boolean>; // boolean
type Type2 = HMOT<string[], boolean>; // boolean[]
type Type3 = HMOT<[string, number], boolean>; // [boolean, boolean]
type Type4 = HMOT<readonly [string, number], boolean>; // readonly [boolean, boolean]
```

### 条件类型 ###

条件类型类似于JS中的三目运算符，只是类型的判断没有JS那么丰富。TS的类型检验是在编译阶段进行的，所以判断条件只有 `extends` 一个语句。条件判断示例如下：

```TypeScript
type T1 = true extends boolean ? string : number; // string
type T2 = 1 extends boolean ? string : number; // number
```

条件表达式`extends`前面的类型经可能使用`裸类型`，所谓`裸类型`就是没有任何装饰的类型参数。如下：

```TypeScript
type T1<T> = T extends string ? true : false; // T没有任何装饰是裸类型
type T2<T> = [T] extends [string] ? true : false; // [T]是T的一个元组，所以不是裸类型

// 乍一看好像也没毛病
type T1T1 = T1<string>; // true
type T2T1 = T2<string>; // true

// 但是对于联合类型就不一样了
type T1T2 = T1<string | number>; // boolean
type T2T2 = T2<string | number>; // false
```

对于裸类型可以展开：

```TypeScript
T = A | B
T extends U ? X : Y
// 相当于
(A extends U ? X : Y) | (B extends U ? X : Y)
```

上例中 `T1T2` 是裸类型可以展开相当于 `(string extends string ? true : false) | (number extends string ? true : false)` 也就是 `true | false` 也就是 `boolean`, 但 `T2T2` 相当于 `[string | number] extends [string] ? true : false` , 但是元组 `[string | number]` 不是元组 `[string]`的子类型，所以是 `false`。通常裸类型可以展开更符合类型判断。

### 类型查询 ###

在JS中 `typeof` 可以判断一个变量的类型，TS对 `typeof` 做了扩展，在类型别名 `type` 等号右侧的 `typeof` 获取的是变量在TS中定义的类型。

```TypeScript
const a: string = typeof '123'; // 'string'
function fn() {}
class C {}
const c: C = new C()

type T1 = typeof '123'; // Error 需要是个变量 这里认为'123'已经是字面量类型了 无法查询该类型的类型
type T2 = typeof a; // string
type T3 = typeof fn; // () => void
type T4 = typeof C; // 类C的构造函数类型（重要）
type T5 = typeof c; // 类C
```

### infer关键字 ###

我们看看本节最后一个知识点 `infer` ，这个看完你就会写工具类型了，是不是很开心？`infer` 功能非常强大，它可以反查类型，需要与 `extends` 配合使用。直接看例子：

```TypeScript
type ArrayItemType<T> = T extends Array<infer U> ? U : never;
type T1 = ArrayItemType<number[]>; // number

type GetABType<T> = T extends {a: infer U, b: infer U} ? U : never;
type T2 = GetABType<{a: string; b: number}>; // string | number

// infer 也可以命名不同
type GetABType2<T> = T extends {a: infer U, b: infer K} ? [U, K] : never;
type T3 = GetABType2<{a: string; b: number}>; // [string, number]

// 这里用never是有说法的 比如：
type T4 = ArrayItemType<(number[] | string)>; // number
// 上面ArrayItemType<number[]>返回number ArrayItemType<string>返回never
// 整体结果是 number | never 也就是number 相当于自动过滤掉了错误的类型
```

## 手撕工具类型 ##

上面我们已经简绍了 `Partial<T>`、`Readonly<T>` 和 `Required<T>`，你应该已经明白一件事，要判断类型几乎一定会用到 `extends`、`in` 或 `keyof`，本节将手撕更多的工具类型。

### TypeName ###

`TypeName<T>` 根据传入的T，返回T的类型的字符串，实际上这里的字符串是一种字符串字面量类型。

```TypeScript
// 使用：
type T1 = TypeName<'123'>; // string
type T2 = TypeName<123>; // number
type T3 = TypeName<123 | true>; // number | boolean
type T4 = TypeName<{}>; // object

// 思路：通过extends来判断是不是对应类型的子类型，从而给出对应的类型

// 实现：
type TypeName<T> = T extends string ? "string" :
    T extends number ? "number" :
    T extends boolean ? "boolean" :
    T extends undefined ? "undefined" :
    T extends Function ? "function" :
    "object";
```

### Exclude ###

`Exclude<T, U>` 可以在类型 `T` 中排除类型 `U` 。这里需要回顾一下在联合类型中，任何类型与 `never` 类型的联合是任何类型。

```TypeScript
// 使用：
type T1 = Exclude<string | number | boolean, string | number>; // boolean

// 思路：首先肯定是用到了裸类型，因为裸类型的联合类型是每一种类型的展开，其他不满足的应该返回never，所以最后是never和其他类型的联合，那么never将会被省略。

// 实现：
type Exclude<T, U> = T extends U ? never : T;
```

### Extract ###

`Exclude<T, U>` 从 `T` 中提取 `U` ，通常 `T` 和 `U` 都是联合类型。

```TypeScript
// 使用：
type T1 = Extract<string | number | boolean, string | object>; // string

// 思路：逻辑与 Exclude 相反，T 在 U 的里面则返回 T 否则是 never

// 实现：
type Extract<T, U> = T extends U ? T : never;
```

### NonNullable ###

`NonNullable<T>` 如果 `T` 中包含了 `null` 或者 `undefined` 则删除 `null` 和 `undefined` 。

```TypeScript
// 使用：
type T1 = NonNullable<null | undefined | string>; // string

// 思路：更上面一样的套路

// 实现：
type NonNullable<T> = T extends null | undefined ? never : T;

// 这里还有一种实现方式 由于`null`或`undefined`与对象交叉的结果是never，而空对象类型与其他交叉是其他类型。所以也可以利用这个特性判断
type NonNullable<T> = T & {}
```

### Record ###

`Record<K, T>` 把 `K` 中的值作为键，`T` 作为值的类型来构建对象。

```TypeScript
// 使用：
type T1 = Record<'x' | 'y', number>;
// 相当于
// type T1 = {
//     x: number;
//     y: number;
// }

// 思路：映射K，返回类型T。

// 实现：
// 你可能打手一挥：
type Record<K, T> = { [P in K]: T; }; // Error

// 上面会报错，因为K要作为键必须是 string | number | symbol 的子类型 所以应该添加约束
type Record<K extends string | number | symbol, T> = { [P in K]: T; }
// 由于 keyof any 就是 string | number | symbol，所以更精简的写法：
type Record<K extends keyof any, T> = { [P in K]: T; };
```

### Pick ###

`Pick<T, K>` 的作用是从对象类型 `T` 中，挑选出键在 `K` 中的属性，从而组成新的对象。

```TypeScript
// 使用：
type T = {
  a?: string | undefined | null;
  readonly b : number | null | undefined;
  c: number;
}

type PickT = Pick<T, 'a' | 'b'>;
// 相当于
// type PickT = {
//     a?: string | undefined | null;
//     readonly b: number | null | undefined;
// }

// 思路：Pick<T, K>有两个泛型，根据K映射出新的对象。

// 实现：
// 你可能大笔一挥
type Pick<T, K> = { [P in K]: T[P]; }; // Error

// 上面有两个问题
// 1. Pick中没有keyof所以是非同态映射，所以不会保留操作符；
// 2. K可能不是T中的key。
// 这里可以这么写，通过 extends keyof 把非同态转化为同态是一个小技巧：
type Pick<T, K extends keyof T> = { [P in K]: T[P]; }; // OK
```

### Omit ###

`Omit<T, K>` 与 `Pick<T, K>` 是互补的。它是已经类型删掉某些属性从而形成新的类型。

```TypeScript
// 使用：
type T = {
  a?: string | undefined | null;
  readonly b : number | null | undefined;
  c: number;
}

type OmitT = Omit<T, 'c'>;
// 相当于：
// type OmitT = {
//     a?: string | undefined | null;
//     readonly b: number | null | undefined;
// }

// 思路：首页K既然是键，那么就应该满足约束是string | number | symbol（或者keyof any）的子类型，否则会报错，跟Pick相反，Pick是选择K里面的属性，这是是不能选择K里面的属性也就是T先要排除K中的属性，所以得用Exclude排除掉。

// 实现：
type Omit<T, K extends keyof any> = { [P in Exclude<keyof T, K>]: T[P]; }
```

### Parameters ###

`Parameters<T>`，根据函数 `T` 的类型，返回函数 `T` 参数的元组。

```TypeScript
// 使用：
type T1 = Parameters<() => void>; // []
type T2 = Parameters<(s: string) => void>; // [string]
type T3 = Parameters<(s: string, n: number) => void>; // [string, number]
type T4 = Parameters<(...args: string[]) => void>; // string[]
type T5 = Parameters<any>; // unknown[]


// 思路：首先T应该满足函数约束，然后通过infer获取到参数列表。

// 实现：
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
```

### ReturnType ###

`ReturnType<T>` 可以获取函数T的返回值类型。

```TypeScript
// 使用：
type T1 = ReturnType<() => void>; // void
type T2 = ReturnType<() => string>; // string
type T3 = ReturnType<() => { a: string }>; // { a: string }
type T4 = ReturnType<<T>() => T>; // unknown
type T5 = ReturnType<any>; // any

// 思路：与 Parameters 类似，只是 infer 取得是返回值。

// 实现：
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

### ConstructorParameters ###

`ConstructorParameters<T>` 获取构造函数T的参数，返回对应参数的元组。

```TypeScript
// 使用：
abstract class A {
    constructor(arg: string) {}
}

class B extends A {
    constructor(...args: string[]) {
        super(args[0])
    }
}

type T1 = ConstructorParameters<new () => object>; // []
type T2 = ConstructorParameters<typeof A>; // [string]
type T3 = ConstructorParameters<new (s: string, n: number) => object>; // [string, number]
type T4 = ConstructorParameters<typeof B>; // string[]
type T5 = ConstructorParameters<any>; // unknown[]

// 思路：实现思路与Parameters类似，只是约束必须是构造函数方法。这里需要注意的是如果抽象类也支持获取构造函数的参数，那么需要在 new 之前添加 abstract 关键字。

// 实现：
type ConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (...args: infer P) => any ? P : never;
```

### InstanceType ###

`InstanceType<T>` 获取构造函数返回值类型。

```TypeScript
// 使用：
abstract class A {
    constructor(arg: string) {}
}

class B extends A {
    constructor(...args: string[]) {
        super(args[0])
    }
}

type T1 = InstanceType<new () => object>; // object
type T2 = InstanceType<typeof A>; // A
type T4 = InstanceType<typeof B>; // B
type T5 = InstanceType<any>; // any

// 思路：与 ConstructorParameters 类型，只是 infer 取的是返回值。

// 实现：
type InstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R ? R : any;
```

### ThisParameterType ###

`ThisParameterType<T>` 获取函数的 `this` 参数类型，若没有定义 `this` 参数则返回 `unknown`。

```TypeScript
// 使用：
function f1(this:object, x: number) {}
function f2(x: number) {}

type T1 = ThisParameterType<typeof f1>; // object
type T2 = ThisParameterType<typeof f2>; // unknown

// 思路：infer取this的类型。

// 实现：
type ThisParameterType<T> = T extends (this: infer U, ...args: never) => any ? U : unknown
```

### OmitThisParameter ###

`OmitThisParameter<T>` 能从函数 `T` 中剔除 `this` 函数类型。

```TypeScript
// 使用：
function f1(this:object, x: number) {}
function f2(x: number) {}

type T1 = OmitThisParameter<typeof f1>; // (x: number) => void
type T2 = OmitThisParameter<typeof f2>; // (x: number) => void
type T3 = OmitThisParameter<string>; // string
type T4 = OmitThisParameter<unknown>; // unknown

// 思路：如果函数类型包含this定义，那么去除this，如果函数类型不包含this的定义则直接把该函数返回。如何判断函数包含this定义呢？可以通过 ThisParameterType 获取看是不是 unknown。这里对于非函数类型，直接返回该类型，如上面string返回的是string。

// 实现：
type OmitThisParameter<T> = unknown extends ThisParameterType<T> ? T : T extends (...args: infer A) => infer R ? (...args: A) => R : T
```
