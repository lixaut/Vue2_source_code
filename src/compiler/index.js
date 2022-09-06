
import { parseHTML, defaultTagRE } from "./parse"

function genProps(attrs) {
    let str = '' // [{name , value}, {name, value}]
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i]
        if (attr.name === 'style') {
            // color:red;background:red => {color:'red',background:'red'}
            let obj = {}
            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':')
                obj[key] = value
            })
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0, -1)}}`
}

function gen(node) {
    if (node.type == 1) {
        return codegen(node)
    } else {
        // 文本
        let text = node.text
        if (!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})`
        } else {
            // _V(_s(name)+'hello'+_s(name))
            let tokens = []
            let match
            defaultTagRE.lastIndex = 0
            let lastIndex = 0
            while (match = defaultTagRE.exec(text)) {
                let index = match.index
                if (index > lastIndex) {
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)))
                }
                tokens.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length
            }
            if (lastIndex < text.length) {
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }
            return `_v(${tokens.join('+')})`
        }
    }
}

function genChildren(children) {
    return children.map(child => gen(child)).join(',')
}

function codegen(ast) {
    let children = genChildren(ast.children)
    let code = (`_c('${ ast.tag }',${
        ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'
        }${
            ast.children.length > 0 ? `,${ children }` : ''
    })`)
    return code
}

// 对模板进行编译处理
export function compileToFunction(template) {
    // 1. 将template转换成 ast语法树
    let ast = parseHTML(template)
    // console.log(ast)

    // 2. 生成render方法（render方法返回的结果就是 虚拟DOM

    let code = codegen(ast)
    code = `with(this){return ${code}}`
    let render = new Function(code) // 根据代码生成render函数
    return render

    /*
    render() {
        return _c(
            'div', 
            { id: 'app' },
            _c(
                'div', 
                { style: { color: 'red'}},
                _v(_s(name) + 'hello'),
                _c(
                    'span',
                    undefined,
                    _v(_s(age))
                )
            )
        )
    }
    */

} 