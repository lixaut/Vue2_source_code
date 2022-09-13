## 环境搭建

1. 安装依赖

```js
npm install rollup rollup-plugin-babel @babel/core @babel/preset-env --save-dev
```

2. 添加配置文件`rollup.confing.js`

3. `package.json`添加配置描述

```js
    "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "rollup -cw"
    },
```

## 模板解析

* vue核心流程

    1. 创造响应数据
    2. 模板转换成ast语法树
    3. 将ast语法树转换成render函数
    4. 后续每次数据更新只执行render函数（无需再进行ast数转换的过程）
    5. render函数会产生虚拟节点（使用响应数据）
    6. 根据生成的虚拟节点创造真实的DOM

* vue中的依赖收集

dep和watcher是一个多对多的关系

一个属性可以在多个组件中使用：dep => 多个watcher

一个组件中由多个属性组成：watcher => 多个dep

* 观察者模式

每个属性有一个dep（属性就是被观察者）

watcher就是观察值（属性变化了就会通知观察者来更新）

## diff算法

原始：在每次更新中，都会产生新的虚拟节点，通过新的虚拟节点生成真实节点，生成后换掉老的节点

算法：第一次渲染的时候会产生虚拟点，第二次更也会调用render方法产生新的虚拟节点，对比出需要更新的内容更新部分内容

diff算法是一个平级比较的过程，父亲和父亲比，儿子和儿子比

* 算法比较步骤

    1. 两个节点不是同一个节点 直接删除老的 换上新的
    2. 两个节点是同一个节点（判断节点的tag和key）比较两个节点的属性是否有差异（复用老的节点，将差异的属性更换）
    3. 节点比较完毕就需要比较两人的儿子

## 组件component

1. 组件的三大特性

    * 自定义标签
    * 组件有自己的属性和事件
    * 组件的插槽

