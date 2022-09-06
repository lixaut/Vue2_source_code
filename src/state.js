
import { observe } from "./observe"

export function initState(vm) {
    const opts = vm.$options // 获取所有的选项
    if(opts.data) {
        initData(vm)
    }
}

function proxy(vm, target, key) {
    Object.defineProperty(vm, key, { // vm.name
        get() {
            return vm[target][key] //vm._data.name
        },
        set(newValue) {
            vm[target][key] = newValue
        }
    })
}

function initData(vm) {
    let data = vm.$options.data // data可能是函数和对象
    data = typeof data === 'function' ? data.call(vm) : data
    // console.log(data)

    // 对数据进行劫持 vue2 里采用了一个api defineProperty
    vm._data = data
    observe(data)

    // 将vm._data用vm来代理就可以
    for(let key in data) {
        proxy(vm, '_data', key)
    }
    
}