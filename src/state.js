
import { observe } from "./observe"
import Dep from "./observe/dep"
import Watcher from "./observe/watcher"

export function initState(vm) {
    const opts = vm.$options // 获取所有的选项
    if(opts.data) {
        initData(vm)
    }
    if (opts.computed) {
        initComputed(vm)
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

function initComputed(vm) {
    const computed = vm.$options.computed
    const watchers = vm._computedWatchers = {}
    for (let key in computed) {
        let userDef = computed[key]

        // 需要监控计算属性中get的变化
        let fn = typeof userDef === 'function' ? userDef : userDef.get
        watchers[key] = new Watcher(vm, fn, {lazy: true})

        defineComputed(vm, key, userDef)
    }
}

function defineComputed(target, key, userDef) {
    const setter = userDef.set || (() => {})

    // 可以通过实例拿到对应的属性
    Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
    })
}

function createComputedGetter(key) {
    // 需要检查是否要执行这个getter
    return function() {
        const watcher = this._computedWatchers[key]
        if (watcher.dirty) {
            // 如果是脏的就去执行 用户传入的函数
            watcher.evaluate()
        }
        if (Dep.target) {
            // 计算属性出栈后，还有渲染watcher
            watcher.depend()
        }
        return watcher.value
    }
}