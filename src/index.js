
import { compileToFunction } from "./compiler"
import { initGloablAPI } from "./gloablAPI"
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle"
import { initStateMixin } from "./state"
import { createElm, patch } from "./vdom/patch"

// 将所有的方法都耦合在一起
function Vue(options) {  // options用户的选项
    this._init(options)
}

initMixin(Vue) // 扩展init方法

initLifeCycle(Vue) // vm_update vm._render

initGloablAPI(Vue) // 全局API实现

initStateMixin(Vue) // nextTick 和 $watch

// 测试：为了方便观察前后的虚拟节点变化
// let render1 = compileToFunction(`<ul style="color:red">
//     <li key="a">a</li>
//     <li key="b">b</li>
//     <li key="c">c</li>
//     <li key="d">d</li>
// </ul>`)
// let vm1 = new Vue({data: {name: 'zhu'}})
// let preVnode = render1.call(vm1)

// let el = createElm(preVnode)
// document.body.appendChild(el)

// let render2 = compileToFunction(`<ul style="color:blue;background:red">
//     <li key="d">d</li>
//     <li key="c">c</li>
//     <li key="b">b</li>
//     <li key="a">a</li>
// </ul>`)
// let vm2 =new Vue({data: {name: 'zhu'}})
// let nextVnode = render2.call(vm2)

// setTimeout(() => {
//     patch(preVnode, nextVnode)
// }, 1000)
export default Vue