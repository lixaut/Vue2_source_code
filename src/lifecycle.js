
export function initLifeCycle(Vue) {
    Vue.prototype._update = function () {
        console.log('update')
    }
    Vue.prototype._render = function () {
        console.log('render')
    }
}

export function mountComponent(vm, el) {
    // 1. 调用render 产生虚拟DOM
    vm._update(vm._render()) // vm.$options.render() 虚拟节点
    // 2. 根据虚拟DOM产生真实DOM
    // 3 插入到el元素中
}