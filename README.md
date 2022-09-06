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

