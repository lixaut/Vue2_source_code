
import { initGloablAPI } from "./gloablAPI"
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle"
import Watcher, { nextTick } from "./observe/watcher"

// 将所有的方法都耦合在一起
function Vue(options) {  // options用户的选项
    this._init(options)
}

Vue.prototype.$nextTick = nextTick

Vue.prototype.$watch = function(exprOrFn, cb, options = {}) {
    // name
    // () => vm.name

    // name值变化，直接执行cb
    new Watcher(this, exprOrFn, {user: true}, cb)
}

initMixin(Vue)

initLifeCycle(Vue)

initGloablAPI(Vue)

export default Vue