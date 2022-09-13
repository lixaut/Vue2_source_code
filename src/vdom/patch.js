import { isSameVnode } from "."


export function createElm(vnode) {
    let { tag, data, children, text } = vnode
    if (typeof tag === 'string') {// 标签
        // 将虚拟节点和真实节点对应起来
        vnode.el = document.createElement(tag)

        // 更新属性
        patchProps(vnode.el, {}, data)

        children.forEach(child => {
            vnode.el.appendChild(createElm(child))
        })
    } else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

export function patchProps(el, oldProps={}, props={}) {
    let oldStyles = oldProps.style || {}
    let newStyles = props.style || {}
    for (let key in oldStyles) {
        if (!newStyles[key]) { // 老的样式中有新的吗，没有则删除
            el.style[key] = ''
        }
    }
    for (let key in oldProps) {
        if (!props[key]) { // 用新的覆盖老的
            el.removeAttribute(key)
        }
    }
    for (let key in props) {
        if (key === 'style') {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        } else {
            el.setAttribute(key, props[key])
        }
    }
    // 老的属性中有要删除的

}

export function patch(oldVNode, vnode) {
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
        return patchVnode(oldVNode, vnode)
    }
}

function patchVnode(oldVNode, vnode) {
    if (!isSameVnode(oldVNode, vnode)) {
        // 用老节点的父亲替换
        let el = createElm(vnode)
        oldVNode.el.parentNode.replaceChild(el, oldVNode.el)
        return el
    }

    let el = vnode.el = oldVNode.el // 复用老节点的元素
    // 文本的情况
    if (!oldVNode.tag) {
        if (oldVNode.text !== vnode.text) {
            el.textContent = vnode.text // 用新的覆盖老的
        }
    }
    // 是标签 我们需要比对标签的属性
    patchProps(el, oldVNode.data, vnode.data)

    // 比较儿子节点（单方有，双方有）
    let oldChildren = oldVNode.children || []
    let newChildren = vnode.children || []

    if (oldChildren.length > 0 && newChildren.length > 0) {
        // 完整的diff算法，需要比较两个儿子
        updateChildren(el, oldChildren, newChildren)
    } else if (newChildren.length > 0) { // 没有老的，只有新的
        mountChildren(el, newChildren)
    } else if (oldChildren.length > 0) { // 新的没有，删除老的
        el.innerHTML = ''
    }

    return el
}

function mountChildren(el, newChildren) {
    for (let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i]
        el.appendChild(createElm(child))
    }
}

function updateChildren(el, oldChildren, newChildren) {
    // 我们操作列表，经常会有push shift unshift pop 这些方法，针对这些情况做一些优化
    // vue2中采用上指针的方式，比较两个节点
    let oldStartIndex = 0
    let newStartIndex = 0
    let oldEndIndex = oldChildren.length - 1
    let newEndIndex = newChildren.length - 1

    let oldStartVnode = oldChildren[0]
    let newStartVnode = newChildren[0]

    let oldEndVnode = oldChildren[oldEndIndex]
    let newEndVnode = newChildren[newEndIndex]

    function makeIndexByKey(children) {
        let map = {}
        children.forEach((child, index) => {
            if (child.key) {
                map[child.key] = index 
            }
        })
        return map
    }
    let map = makeIndexByKey(oldChildren)

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        // 双方有一方头指针，大于尾部指针停止循环

        if (!oldStartVnode) {
            oldStartVnode = oldChildren[++oldStartIndex]
        } else if (!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex]
        }

        // 先比较头指针
        else if (isSameVnode(oldStartVnode, newStartVnode)) {
            patchVnode(oldStartVnode, newStartVnode)
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
        }

        // 先比较尾指针
        else if (isSameVnode(oldEndVnode, newEndVnode)) {
            patchVnode(oldEndVnode, newEndVnode)
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndIndex]
        }

        // 交叉比对 abcd <-> dcba
        else if (isSameVnode(oldEndVnode, newStartVnode)) {
            patchVnode(oldEndVnode, newStartVnode)
            el.insertBefore(oldEndVnode.el, oldStartVnode.el)
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = newChildren[++newStartIndex]
        }

        else if (isSameVnode(oldStartVnode, newEndVnode)) {
            patchVnode(oldStartVnode, newEndVnode)
            el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = newChildren[--newEndIndex]
        }

        // debugger
        let moveIndex = map[newStartVnode.key]
        if (moveIndex !== undefined) {
            let moveVnode = oldChildren[moveIndex]
            el.insertBefore(moveVnode.el, oldStartVnode.el)
            oldChildren[moveIndex] = undefined
            patchVnode(moveVnode, newStartVnode)

        } else {
            el.insertBefore(createElm(newStartVnode), oldStartVnode.el)
        }
        newStartVnode = newChildren[++newStartIndex]

    }
    
    // 新的多余，需要插入
    if (newStartIndex <= newEndIndex) { 
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            let childEl = createElm(newChildren[i])
            // 可能向前追加，也可能向后追加

            let anchor = newChildren[newEndIndex + 1] ?
            newChildren[newEndIndex + 1].el : null // 获取下一个元素
            el.insertBefore(childEl, anchor)

            // el.appendChild(childEl)
        }
    }

    // 老的多了，需要删除
    if (oldStartIndex <= oldEndIndex) { 
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            if (oldChildren[i]) {
                let childEl = oldChildren[i].el
                el.removeChild(childEl)
            }
        }
    }
}