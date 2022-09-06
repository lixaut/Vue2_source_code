

const attribute =
    /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>']+)))?/

const ncname = '[a-zA-Z_][\\w\\-\\.]*'

const qnameCapture = `((?:${ncname}\\:)?${ncname})`

const startTagOpen = new RegExp(`^<${qnameCapture}`)

const startTagClose = /^\s*(\/?)>/

const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

export const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

// 对模板进行编译处理
export function parseHTML(html) {

    const ELEMENT_TYPE = 1
    const TEXT_TYPE = 3
    const stack = [] // 用于存放元素
    let currentParent // 指向栈中最后一个
    let root

    // 最终需要转化成一棵抽象语法树
    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }

    // 利用栈来构造一棵树
    function start(tag, attrs) {
        // console.log(tag, attrs, '开始')
        let node = createASTElement(tag, attrs) // 创造一个ast节点
        // console.log(node)
        if (!root) { // 看一下是否是空树
            root = node // 如果为空则当前树是树的根节点
        }
        if (currentParent) {
            node.parent = currentParent
            currentParent.children.push(node)
        }
        stack.push(node)
        currentParent = node // currentParent为栈中最后一个
    }

    function chars(text) { // 文本直接放到当前指向的节点中
        // console.log(text, '文本')
        text = text.replace(/\s/g, '')
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent
        })
    }

    function end(tag) {
        // console.log(tag, '结束')
        stack.pop()
        currentParent = stack[stack.length - 1]
    }

    // 解析一个删除一个
    function advance(n) {
        html = html.substring(n)
    }

    // 解析开始标签
    function parseStartTag() {
        const start = html.match(startTagOpen)
        if (start) {
            const match = {
                tagName: start[1], // 标签名
                attrs: [] // 标签属性
            }
            advance(start[0].length)

            // 如果不是开始标签的结束，就一直匹配下去
            let attr, end;
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                // console.log(typeof attr[3])
                advance(attr[0].length)
                match.attrs.push({
                    name: attr[1],
                    value: attr[3]
                })
                // console.log(match.attrs[1])
            }
            if (end) {
                advance(end[0].length)
            }
            return match
        }
        // 不是开始标签
        return false
    }

    while (html) {
        // textEnd = 0,开始标签或是结束标签
        // textEnd > 0,文本结束的地方
        let textEnd = html.indexOf('<')
        if (textEnd == 0) {
            const startTagMatch = parseStartTag() // 开始标签的匹配
            // console.log(startTagMatch.attrs)
            if (startTagMatch) { // 解析到开始标签
                // console.log(startTagMatch)
                start(startTagMatch.tagName, startTagMatch.attrs)
                // console.log(root)
                continue;
            }
            let endTagMatch = html.match(endTag)
            if (endTagMatch) {
                advance(endTagMatch[0].length);
                end(endTagMatch[1])
                // console.log(endTagMatch)
                continue;
            }
        }
        if (textEnd > 0) {
            let text = html.substring(0, textEnd) // 文本内容
            if (text) {
                chars(text)
                advance(text.length)
                // console.log(text)
            }
        }
    }
    // console.log(root)
    return root
}