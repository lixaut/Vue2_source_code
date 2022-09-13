

const isReservedTag = (tag) => {
    return ['a', 'div', 'p', 'button', 'ul', 'li', 'span'].includes(tag)
}

export function createElementVNode(vm, tag, data, ...children) {
    if (data == null) {
        data = {}
    }
    let key = data.key
    if (key) {
        delete data.key
    }
    
    if (isReservedTag(tag)) {
        return vnode(vm, tag, key, data, children)
    } else {
        // 创造一个组件的虚拟节点（包含组件的构造函数）
        let Ctor = vm.$options.components[tag] // 组建的构造函数
        return createComponentVnode(vm, tag, key, data, children, Ctor)
    }
}

function createComponentVnode(vm, tag, key, data, children, Ctor) {
    if (typeof Ctor === 'object') {
        Ctor = vm.$options._base.extend(Ctor)
    }

    data.hook = {
        init() {
            
        }
    }
    return vnode(vm, tag, key, data, children, null, {Ctor})
}

export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}

function vnode(vm, tag, key, data, children, text, componentOptions) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text,
        componentOptions // 组件的构造函数
    }
}

export function isSameVnode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key
}

/*
    1. ast做的是语法层面的转化，描述的是语法本身
    2. 虚拟DOM，描述的是DOM元素，可以增加一些自定义属性
*/

