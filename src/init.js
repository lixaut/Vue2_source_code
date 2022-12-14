
import { compileToFunction } from "./compiler"
import { initState } from "./state"
import { callHook, mountComponent } from "./lifecycle"
import { mergeOptions } from "./utils"

export function initMixin(Vue) { // 给Vue增加init方法
    Vue.prototype._init = function (options) { // 初始化操作
        const vm = this
        vm.$options = mergeOptions(this.constructor.options, options) // 将用户的选项挂载到实例上

        callHook(vm, 'beforeCreate')
        // 初始化状态,初始化计算属性
        initState(vm)

        callHook(vm, 'created')

        if (options.el) {
            // 实现数据的挂载
            vm.$mount(options.el)
        }
    }

    Vue.prototype.$mount = function (el) {
        const vm = this
        el = document.querySelector(el)
        let ops = vm.$options
        if (!ops.render) { // 先进行查找有没有render函数
            let template // 没有render看一下是否写了template，没写template，采用外部的templat
            if (!ops.template && el) { //没有写模板，但是写了el
                template = el.outerHTML
            } else {
                // 写了template，就用写了的template
                if(el) {
                    template = ops.template
                }
            }
            // 需要对模板进行编译
            if(template) {
                const render = compileToFunction(template)
                ops.render = render
            }
        }
        mountComponent(vm, el) // 组件的挂载
        // 最终可以获取render方法
    }
}
