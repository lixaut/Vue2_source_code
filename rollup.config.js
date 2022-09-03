
// rollup默认可以导出一个对象，作为打包的配置文件
import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

export default {
    // 入口文件
    input: './src/index.js',
    // 出口
    output: {
        file: './dist/vue.js',
        name: 'Vue',
        format: 'umd',
        // 可以调试源代码
        sourcemap: true
    },
    plugins: [
        babel({
            // 排除node_modules所有文件
            exclude: 'node_modules/**'
        }),
        resolve()
    ]
}