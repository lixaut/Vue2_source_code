import Dep from "./dep"

let id = 0

class Watcher { // 不同的组件有不同的watcher，
    constructor(vm, fn, options) {
        this.id = id++
        this.getter = fn
        this.renderWatcher = options
        this.deps = []
        this.depsId = new Set()
        this.get()
    }
    get() {
        Dep.target = this
        this.getter()
        Dep.target = null
    }
    addDep(dep) {
        let id = dep.id
        if (!this.depsId.has(id)) {
            this.deps.push(dep)
            this.depsId.add(id)
            dep.addSub(this) // watcher已经记住了dep，而且去重了，此时让dep也记住watcher
        }
    }
    update() {
        // this.get() // 更新渲染
        queueWatcher(this)
    }
    run() {
        this.get()
    }
}

let queue = []
let has = {}
let pending = false // 防抖

function flushSchedulerQueue() {
    let flushQueue = queue.slice(0)
    queue = []
    has = {}
    pending = false
    flushQueue.forEach(q => q.run())
}

function queueWatcher(watcher) {
    const id = watcher.id
    if (!has[id]) {
        queue.push(watcher)
        has[id] = true
        // 不管我们的update执行多少次，但最终只执行一轮刷新操作
        if (!pending) {
            nextTick(flushSchedulerQueue)
            pending = true
        }
    }
}

let callbacks = []
let waiting = false

function flushCallbacks() {
    waiting = true
    let cbs = callbacks.slice(0)
    callbacks = []
    cbs.forEach(cb => cb())

}

let timerFunc
if (Promise) {
    timerFunc = () => {
        Promise.resolve().then(flushCallbacks)
    }
} else if (MutationObserver) {
    let observer = new MutationObserver(flushCallbacks) // 传入的回调是异步的
    let textNode = document.createTextNode(1)
    observer.observe(textNode, {
        characterData: true
    })
    timerFunc = () => {
        textNode.textContent = 2
    }
} else if (setImmediate) {
    timerFunc = () => {
        setImmediate(flushCallbacks)
    }
} else {
    timerFunc = () => {
        setTimeout(flushCallbacks)
    }
}

// nextTick不是创建了一个异步任务，将任务维护到了队列里
export function nextTick(cb) {
    callbacks.push(cb)
    if (!waiting) {
        timerFunc(flushCallbacks)
        waiting = true
    }
}

// 需要给每个属性增加一个dep，目的就是收集watcher

export default Watcher