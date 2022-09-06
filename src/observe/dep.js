
let id = 0

class Dep {
    constructor() {
        this.id = id++
        this.subs = [] // 存放当前属性的所有watcher
    }
    depend() {
        // this.subs.push(Dep.target) --> 会重复
        Dep.target.addDep(this)
    }
    addSub(watcher) {
        this.subs.push(watcher)
    }
    notify() {
        this.subs.forEach(watcher => {
            watcher.update()
        })
    }
}
Dep.target = null

export default Dep