

export function mergeOptions(parent, child) {
    const strats = {}
    const LIFECYCLE = [
        'beforeCreate',
        'created'
    ]
    LIFECYCLE.forEach(hook => {
        strats[hook] = function (p, c) {
            if (c) {
                if (p) {
                    return p.concat(c)
                } else {
                    return [c]
                }
            } else {
                return p
            }
        }
    })

    strats.components = function(parentVal, childVal) {
        const res = Object.create(parentVal)
        if (childVal) {
            for (let key in childVal) {
                // 返回的是构造的对象，可以拿到父亲原型上的属性，并将儿子的拷贝到自己身上
                res[key] = childVal[key] 
            }
        }
    }

    const options = {}
    for (let key in parent) {
        mergeField(key)
    }
    for (let key in child) {
        // console.log(child)
        if (!parent.hasOwnProperty(key)) {
            mergeField(key)
        }
    }
    function mergeField(key) {
        // 策略模式减少if/else
        if (strats[key]) {
            options[key] = strats[key](parent[key], child[key])
        } else {
            options[key] = child[key] || parent[key] // 优先采用儿子
        }
    }
    return options
}