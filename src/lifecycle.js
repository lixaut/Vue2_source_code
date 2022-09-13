
import Watcher from "./observe/watcher"
import { createElementVNode, createTextVNode } from "./vdom"
import { patch } from './vdom/patch'

export function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) { // 将虚拟DOM转化成真实DOM
        const vm = this
        const el = vm.$el
        // 把组件第一次生产的虚拟节点保存到_vnode上
        const prevVnode = vm._vnode
        vm._vnode = vnode
        if (prevVnode) { // 之前渲染过了
            vm.$el = patch(prevVnode, vnode)
        } else {
            vm.$el = patch(el, vnode)
        }
    }

    // _c('div', {}, ...children)
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments)
    }

    // _v(text)
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments)
    }

    Vue.prototype._s = function (value) {
        if (typeof value !== 'object') return value
        return JSON.stringify(value)
    }

    Vue.prototype._render = function () {
        // 当渲染的时候去实例中取值，就可以将属性和试图绑在一起
        return this.$options.render.call(this)
    }
}

export function mountComponent(vm, el) {
    vm.$el = el
    // 1. 调用render 产生虚拟DOM
    const updateComponent = () => {
        vm._update(vm._render())
    }
    new Watcher(vm, updateComponent, true) // vm.$options.render() 虚拟节点
    // 2. 根据虚拟DOM产生真实DOM
    // 3 插入到el元素中
}

export function callHook(vm, hook) { // 调用钩子函数
    const handlers = vm.$options[hook]
    if (handlers) {
        handlers.forEach(handlers => handlers.call(vm))
    }
}