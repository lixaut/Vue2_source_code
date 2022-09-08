

export function createElm(vnode) {
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

export function patchProps(el, props) {
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
    }
}