
const attribute =
    /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

const ncname = '[a-zA-Z_][\\w\\-\\.]*'

const qnameCapture = `((?:${ncname}\\:)?${ncname})`

const startTagOpen = new RegExp(`^<${qnameCapture}`)

const startTagClose = /^\s*(\/?)>/

const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

// 对模板进行编译处理
function parseHTML(html) {

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
                advance(attr[0].length)
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5]
                })
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
            if (startTagMatch) { // 解析到开始标签
                // console.log(startTagMatch)
                continue;
            }
            let endTagMatch = html.match(endTag)
            if (endTagMatch) {
                advance(endTagMatch[0].length);
                // console.log(endTagMatch)
                continue;
            }
        }
        if (textEnd > 0) {
            let text = html.substring(0, textEnd) // 文本内容
            if (text) {
                advance(text.length)
                // console.log(text)
            }
        }
    }
    // console.log(html)
}

// 对模板进行编译处理
export function compileToFunction(template) {
    // 1. 将template转换成 ast语法树
    let ast = parseHTML(template)
    // 2. 生成render方法（render方法返回的结果就是 虚拟DOM）
} 