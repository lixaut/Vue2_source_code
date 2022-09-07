
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

let stack = []
export function pushTarget(watcher) {
    stack.push(watcher)
    Dep.target = watcher
}
export function popTarget() {
    stack.pop()
    Dep.target = stack[stack.length - 1]
}

export default Dep