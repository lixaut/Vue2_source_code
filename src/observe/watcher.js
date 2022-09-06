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
        this.get() // 更新渲染
    }
}

// 需要给每个属性增加一个dep，目的就是收集watcher

export default Watcher