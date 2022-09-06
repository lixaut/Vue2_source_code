
import Watcher from "./observe/watcher"
import { createElementVNode, createTextVNode } from "./vdom"

function createElm(vnode) {
    let {tag, data, children, text} = vnode
    if (typeof tag === 'string') {// 标签
        // 将虚拟节点和真实节点对应起来
        vnode.el = document.createElement(tag)

        // 更新属性
        patchProps(vnode.el, data)

        children.forEach(child => {
            vnode.el.appendChild(createElm(child))
        })
    } else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

function patchProps(el, props) {
    for (let key in props) {
        if (key === 'style') {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        } else {
            el.setAttribute(key, props[key])
        }
    }
}

function patch(oldVNode, vnode) {
    // 初始渲染流程
    const isRealElement = oldVNode.nodeType
    if (isRealElement) {
        const elm = oldVNode // 获取真实元素
        const parentElm = elm.parentNode // 拿到父元素
        let newElm = createElm(vnode) // 生成新节点
        parentElm.insertBefore(newElm, elm.nextSibling) // 插入新节点
        parentElm.removeChild(elm) // 删除老节点
        return newElm
    } else {
        // diff算法
    }
}

export function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) { // 将虚拟DOM转化成真实DOM
        const vm = this
        const el = vm.$el
        // patch既有初始化的功能，又有更新的功能
        vm.$el = patch(el, vnode)
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