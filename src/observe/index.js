import { newArrayProto } from "./array"
import Dep from "./dep"

class Observer {
    constructor(data) {
        // 给每个对象增加收集功能
        this.dep = new Dep()
        // 给数据加了一个标识，如果数据上有__ob__，则说明这个属性被观测了
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable: false
        })
        // Object.defineProperty只能劫持已经存在的属性
        if(Array.isArray(data)) {
            // 重写数组方法
            data.__proto__ = newArrayProto
            this.observeArray(data)
        } else {
            this.walk(data)
        }
    }
    
    walk(data) { // 循环对象，对属性依次劫持
        // 重新定义属性
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
    }
    observeArray(data) {
        data.forEach(item => observe(item))
    }
}

function dependArray(value) {
    for (let i = 0; i < value.length; i++) {
        let current = value[i]
        current.__ob__ && current.__ob__.dep.depend()
        if (Array.isArray(current)) {
            dependArray(current)
        }
    }
}

export function defineReactive(target, key, value) { // 闭包 属性劫持
    let childObj = observe(value) // 对所有属性进行劫持 用来收集依赖
    let dep = new Dep() // 对所有对象都进行属性劫持
    Object.defineProperty(target, key, {
        get() { // 取值的时候会执行get
            // console.log('用户取值了')
            if (Dep.target) {
                dep.depend()
                if (childObj) {
                    childObj.dep.depend()
                    if (Array.isArray(value)) {
                        dependArray(value)
                    }
                }
            }
            return value
        },
        set(newValue) { // 修改的时候会执行set
            // console.log('用户设置值了')
            if(newValue === value) return
            observe(newValue)
            value = newValue
            dep.notify() // 通知更新
        }
    })
}

export function observe(data) {
    // 劫持对象
    if (typeof data !== 'object' || data == null) {
        return // 只对对象劫持
    }
    if(data.__ob__ instanceof Observer) {
        return data.__ob__
    }
    // console.log(data)

    /*
        如果一个对象被劫持过，那就不需要再被劫持（要判断一个对象是否被劫持过，
        可以增添一个实例，用实例来判断是否被劫持）
    */

    return new Observer(data)
}