
let oldArrayProto = Array.prototype

export let newArrayProto = Object.create(oldArrayProto)

let methods = [
    // 找到所有的变异方法
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice',
]

methods.forEach(method => {
    // arr.push(1, 2, 3)
    newArrayProto[method] = function (...args) { // 重写数组方法
        // push()
        const result = oldArrayProto[method].call(this, ...args) // 内部调用原来方法，函数劫持，切片编程
        // 需要对新增的数据进行劫持
        let inserted
        let ob = this.__ob__

        switch(method) {
            case 'push':
            case 'unshift':
                inserted = args
                break
            case 'splice':
                inserted = args.slice(2)
                break
            default:
                break
        }

        if(inserted) {
            ob.observeArray(inserted)
        }

        ob.dep.notify()
        return result
    }
})

