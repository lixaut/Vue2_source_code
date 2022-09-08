
import { compileToFunction } from "./compiler"
import { initGloablAPI } from "./gloablAPI"
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle"
import { initStateMixin } from "./state"

// 将所有的方法都耦合在一起
function Vue(options) {  // options用户的选项
    this._init(options)
}

initMixin(Vue) // 扩展init方法

initLifeCycle(Vue) // vm_update vm._render

initGloablAPI(Vue) // 全局API实现

initStateMixin(Vue) // nextTick 和 $watch

// 测试：为了方便观察前后的虚拟节点变化
let render1 = compileToFunction(`<div>{{name}}</div>`)
let vm1 = new Vue({data: {name: 'zhu'}})
let preNode = render1.call(vm1)
console.log(preNode)

export default Vue