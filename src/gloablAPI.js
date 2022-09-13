
import { mergeOptions } from './utils'
export function initGloablAPI(Vue) {
    // 静态方法
    Vue.options = {
        _base: Vue
    }
    Vue.mixin = function (mixin) {
        // 我们期望将用户的选项和全局的options进行合并
        this.options = mergeOptions(this.options, mixin)
        return this
    }

    Vue.extend = function(options) {
        // 实现根据用户的参数返回一个构造函数
        function Sub(options={}) {
            this._init(options)
        }
        Sub.prototype = Object.create(Vue.prototype)
        Sub.prototype.constructor = Sub
        Sub.options = mergeOptions(Vue.options, options) // 保存用户传递的选项
        return Sub
    }

    Vue.options.conponents = {}
    Vue.component = function(id, definition) {
        definition = typeof definition === 'function' ? definition : Vue.extend(definition)
        Vue.options.component[id] = definition
    }
}