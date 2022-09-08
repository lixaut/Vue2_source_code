(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    function mergeOptions(parent, child) {
      var strats = {};
      var LIFECYCLE = ['beforeCreate', 'created'];
      LIFECYCLE.forEach(function (hook) {
        strats[hook] = function (p, c) {
          if (c) {
            if (p) {
              return p.concat(c);
            } else {
              return [c];
            }
          } else {
            return p;
          }
        };
      });
      var options = {};

      for (var key in parent) {
        mergeField(key);
      }

      for (var _key in child) {
        // console.log(child)
        if (!parent.hasOwnProperty(_key)) {
          mergeField(_key);
        }
      }

      function mergeField(key) {
        // 策略模式减少if/else
        if (strats[key]) {
          options[key] = strats[key](parent[key], child[key]);
        } else {
          options[key] = child[key] || parent[key]; // 优先采用儿子
        }
      }

      return options;
    }

    function initGloablAPI(Vue) {
      // 静态方法
      Vue.options = {};

      Vue.mixin = function (mixin) {
        // 我们期望将用户的选项和全局的options进行合并
        this.options = mergeOptions(this.options, mixin);
        return this;
      };
    }

    function _typeof(obj) {
      "@babel/helpers - typeof";

      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      }, _typeof(obj);
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", {
        writable: false
      });
      return Constructor;
    }

    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }

    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    function _iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;

      var _s, _e;

      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }

    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;

      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

      return arr2;
    }

    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>']+)))?/;
    var ncname = '[a-zA-Z_][\\w\\-\\.]*';
    var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
    var startTagOpen = new RegExp("^<".concat(qnameCapture));
    var startTagClose = /^\s*(\/?)>/;
    var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));
    var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 对模板进行编译处理

    function parseHTML(html) {
      var ELEMENT_TYPE = 1;
      var TEXT_TYPE = 3;
      var stack = []; // 用于存放元素

      var currentParent; // 指向栈中最后一个

      var root; // 最终需要转化成一棵抽象语法树

      function createASTElement(tag, attrs) {
        return {
          tag: tag,
          type: ELEMENT_TYPE,
          children: [],
          attrs: attrs,
          parent: null
        };
      } // 利用栈来构造一棵树


      function start(tag, attrs) {
        // console.log(tag, attrs, '开始')
        var node = createASTElement(tag, attrs); // 创造一个ast节点
        // console.log(node)

        if (!root) {
          // 看一下是否是空树
          root = node; // 如果为空则当前树是树的根节点
        }

        if (currentParent) {
          node.parent = currentParent;
          currentParent.children.push(node);
        }

        stack.push(node);
        currentParent = node; // currentParent为栈中最后一个
      }

      function chars(text) {
        // 文本直接放到当前指向的节点中
        // console.log(text, '文本')
        text = text.replace(/\s/g, '');
        text && currentParent.children.push({
          type: TEXT_TYPE,
          text: text,
          parent: currentParent
        });
      }

      function end(tag) {
        // console.log(tag, '结束')
        stack.pop();
        currentParent = stack[stack.length - 1];
      } // 解析一个删除一个


      function advance(n) {
        html = html.substring(n);
      } // 解析开始标签


      function parseStartTag() {
        var start = html.match(startTagOpen);

        if (start) {
          var match = {
            tagName: start[1],
            // 标签名
            attrs: [] // 标签属性

          };
          advance(start[0].length); // 如果不是开始标签的结束，就一直匹配下去

          var attr, _end;

          while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            // console.log(typeof attr[3])
            advance(attr[0].length);
            match.attrs.push({
              name: attr[1],
              value: attr[3]
            }); // console.log(match.attrs[1])
          }

          if (_end) {
            advance(_end[0].length);
          }

          return match;
        } // 不是开始标签


        return false;
      }

      while (html) {
        // textEnd = 0,开始标签或是结束标签
        // textEnd > 0,文本结束的地方
        var textEnd = html.indexOf('<');

        if (textEnd == 0) {
          var startTagMatch = parseStartTag(); // 开始标签的匹配
          // console.log(startTagMatch.attrs)

          if (startTagMatch) {
            // 解析到开始标签
            // console.log(startTagMatch)
            start(startTagMatch.tagName, startTagMatch.attrs); // console.log(root)

            continue;
          }

          var endTagMatch = html.match(endTag);

          if (endTagMatch) {
            advance(endTagMatch[0].length);
            end(endTagMatch[1]); // console.log(endTagMatch)

            continue;
          }
        }

        if (textEnd > 0) {
          var text = html.substring(0, textEnd); // 文本内容

          if (text) {
            chars(text);
            advance(text.length); // console.log(text)
          }
        }
      } // console.log(root)


      return root;
    }

    function genProps(attrs) {
      var str = ''; // [{name , value}, {name, value}]

      for (var i = 0; i < attrs.length; i++) {
        var attr = attrs[i];

        if (attr.name === 'style') {
          (function () {
            // color:red;background:red => {color:'red',background:'red'}
            var obj = {};
            attr.value.split(';').forEach(function (item) {
              var _item$split = item.split(':'),
                  _item$split2 = _slicedToArray(_item$split, 2),
                  key = _item$split2[0],
                  value = _item$split2[1];

              obj[key] = value;
            });
            attr.value = obj;
          })();
        }

        str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
      }

      return "{".concat(str.slice(0, -1), "}");
    }

    function gen(node) {
      if (node.type == 1) {
        return codegen(node);
      } else {
        // 文本
        var text = node.text;

        if (!defaultTagRE.test(text)) {
          return "_v(".concat(JSON.stringify(text), ")");
        } else {
          // _V(_s(name)+'hello'+_s(name))
          var tokens = [];
          var match;
          defaultTagRE.lastIndex = 0;
          var lastIndex = 0;

          while (match = defaultTagRE.exec(text)) {
            var index = match.index;

            if (index > lastIndex) {
              tokens.push(JSON.stringify(text.slice(lastIndex, index)));
            }

            tokens.push("_s(".concat(match[1].trim(), ")"));
            lastIndex = index + match[0].length;
          }

          if (lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)));
          }

          return "_v(".concat(tokens.join('+'), ")");
        }
      }
    }

    function genChildren(children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }

    function codegen(ast) {
      var children = genChildren(ast.children);
      var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length > 0 ? ",".concat(children) : '', ")");
      return code;
    } // 对模板进行编译处理


    function compileToFunction(template) {
      // 1. 将template转换成 ast语法树
      var ast = parseHTML(template); // console.log(ast)
      // 2. 生成render方法（render方法返回的结果就是 虚拟DOM

      var code = codegen(ast);
      code = "with(this){return ".concat(code, "}");
      var render = new Function(code); // 根据代码生成render函数

      return render;
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

    var oldArrayProto = Array.prototype;
    var newArrayProto = Object.create(oldArrayProto);
    var methods = [// 找到所有的变异方法
    'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
    methods.forEach(function (method) {
      // arr.push(1, 2, 3)
      newArrayProto[method] = function () {
        var _oldArrayProto$method;

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        // 重写数组方法
        // push()
        var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 内部调用原来方法，函数劫持，切片编程
        // 需要对新增的数据进行劫持


        var inserted;
        var ob = this.__ob__;

        switch (method) {
          case 'push':
          case 'unshift':
            inserted = args;
            break;

          case 'splice':
            inserted = args.slice(2);
            break;
        }

        if (inserted) {
          ob.observeArray(inserted);
        }

        ob.dep.notify();
        return result;
      };
    });

    var id$1 = 0;

    var Dep = /*#__PURE__*/function () {
      function Dep() {
        _classCallCheck(this, Dep);

        this.id = id$1++;
        this.subs = []; // 存放当前属性的所有watcher
      }

      _createClass(Dep, [{
        key: "depend",
        value: function depend() {
          // this.subs.push(Dep.target) --> 会重复
          Dep.target.addDep(this);
        }
      }, {
        key: "addSub",
        value: function addSub(watcher) {
          this.subs.push(watcher);
        }
      }, {
        key: "notify",
        value: function notify() {
          this.subs.forEach(function (watcher) {
            watcher.update();
          });
        }
      }]);

      return Dep;
    }();

    Dep.target = null;
    var stack = [];
    function pushTarget(watcher) {
      stack.push(watcher);
      Dep.target = watcher;
    }
    function popTarget() {
      stack.pop();
      Dep.target = stack[stack.length - 1];
    }

    var Observer = /*#__PURE__*/function () {
      function Observer(data) {
        _classCallCheck(this, Observer);

        // 给每个对象增加收集功能
        this.dep = new Dep(); // 给数据加了一个标识，如果数据上有__ob__，则说明这个属性被观测了

        Object.defineProperty(data, '__ob__', {
          value: this,
          enumerable: false
        }); // Object.defineProperty只能劫持已经存在的属性

        if (Array.isArray(data)) {
          // 重写数组方法
          data.__proto__ = newArrayProto;
          this.observeArray(data);
        } else {
          this.walk(data);
        }
      }

      _createClass(Observer, [{
        key: "walk",
        value: function walk(data) {
          // 循环对象，对属性依次劫持
          // 重新定义属性
          Object.keys(data).forEach(function (key) {
            return defineReactive(data, key, data[key]);
          });
        }
      }, {
        key: "observeArray",
        value: function observeArray(data) {
          data.forEach(function (item) {
            return observe(item);
          });
        }
      }]);

      return Observer;
    }();

    function dependArray(value) {
      for (var i = 0; i < value.length; i++) {
        var current = value[i];
        current.__ob__ && current.__ob__.dep.depend();

        if (Array.isArray(current)) {
          dependArray(current);
        }
      }
    }

    function defineReactive(target, key, value) {
      // 闭包 属性劫持
      var childObj = observe(value); // 对所有属性进行劫持 用来收集依赖

      var dep = new Dep(); // 对所有对象都进行属性劫持

      Object.defineProperty(target, key, {
        get: function get() {
          // 取值的时候会执行get
          // console.log('用户取值了')
          if (Dep.target) {
            dep.depend();

            if (childObj) {
              childObj.dep.depend();

              if (Array.isArray(value)) {
                dependArray(value);
              }
            }
          }

          return value;
        },
        set: function set(newValue) {
          // 修改的时候会执行set
          // console.log('用户设置值了')
          if (newValue === value) return;
          observe(newValue);
          value = newValue;
          dep.notify(); // 通知更新
        }
      });
    }
    function observe(data) {
      // 劫持对象
      if (_typeof(data) !== 'object' || data == null) {
        return; // 只对对象劫持
      }

      if (data.__ob__ instanceof Observer) {
        return data.__ob__;
      } // console.log(data)

      /*
          如果一个对象被劫持过，那就不需要再被劫持（要判断一个对象是否被劫持过，
          可以增添一个实例，用实例来判断是否被劫持）
      */


      return new Observer(data);
    }

    var id = 0;

    var Watcher = /*#__PURE__*/function () {
      // 不同的组件有不同的watcher，
      function Watcher(vm, exprOrFn, options, cb) {
        _classCallCheck(this, Watcher);

        this.id = id++;

        if (typeof exprOrFn === 'string') {
          this.getter = function () {
            return vm[exprOrFn];
          };
        } else {
          this.getter = exprOrFn;
        }

        this.renderWatcher = options;
        this.deps = [];
        this.depsId = new Set();
        this.lazy = options.lazy;
        this.cb = cb;
        this.dirty = this.lazy;
        this.vm = vm;
        this.user = options.user;
        this.value = this.lazy ? undefined : this.get();
      }

      _createClass(Watcher, [{
        key: "evaluate",
        value: function evaluate() {
          this.value = this.get();
          this.dirty = false;
        }
      }, {
        key: "get",
        value: function get() {
          pushTarget(this);
          var value = this.getter.call(this.vm);
          popTarget();
          return value;
        }
      }, {
        key: "addDep",
        value: function addDep(dep) {
          var id = dep.id;

          if (!this.depsId.has(id)) {
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this); // watcher已经记住了dep，而且去重了，此时让dep也记住watcher
          }
        }
      }, {
        key: "depend",
        value: function depend() {
          var i = this.deps.length;

          while (i--) {
            this.deps[i].depend();
          }
        }
      }, {
        key: "update",
        value: function update() {
          if (this.lazy) {
            // 如果是计算属性，依赖的值变化了，就标识计算属性是脏值
            this.dirty = true;
          } else {
            // this.get() // 更新渲染
            queueWatcher(this);
          }
        }
      }, {
        key: "run",
        value: function run() {
          var oldValue = this.value;
          var newValue = this.get();

          if (this.user) {
            this.cb.call(this.vm, newValue, oldValue);
          }
        }
      }]);

      return Watcher;
    }();

    var queue = [];
    var has = {};
    var pending = false; // 防抖

    function flushSchedulerQueue() {
      var flushQueue = queue.slice(0);
      queue = [];
      has = {};
      pending = false;
      flushQueue.forEach(function (q) {
        return q.run();
      });
    }

    function queueWatcher(watcher) {
      var id = watcher.id;

      if (!has[id]) {
        queue.push(watcher);
        has[id] = true; // 不管我们的update执行多少次，但最终只执行一轮刷新操作

        if (!pending) {
          nextTick(flushSchedulerQueue);
          pending = true;
        }
      }
    }

    var callbacks = [];
    var waiting = false;

    function flushCallbacks() {
      waiting = true;
      var cbs = callbacks.slice(0);
      callbacks = [];
      cbs.forEach(function (cb) {
        return cb();
      });
    }

    var timerFunc;

    if (Promise) {
      timerFunc = function timerFunc() {
        Promise.resolve().then(flushCallbacks);
      };
    } else if (MutationObserver) {
      var observer = new MutationObserver(flushCallbacks); // 传入的回调是异步的

      var textNode = document.createTextNode(1);
      observer.observe(textNode, {
        characterData: true
      });

      timerFunc = function timerFunc() {
        textNode.textContent = 2;
      };
    } else if (setImmediate) {
      timerFunc = function timerFunc() {
        setImmediate(flushCallbacks);
      };
    } else {
      timerFunc = function timerFunc() {
        setTimeout(flushCallbacks);
      };
    } // nextTick不是创建了一个异步任务，将任务维护到了队列里


    function nextTick(cb) {
      callbacks.push(cb);

      if (!waiting) {
        timerFunc(flushCallbacks);
        waiting = true;
      }
    } // 需要给每个属性增加一个dep，目的就是收集watcher

    function initState(vm) {
      var opts = vm.$options; // 获取所有的选项

      if (opts.data) {
        initData(vm);
      }

      if (opts.computed) {
        initComputed(vm);
      }

      if (opts.watch) {
        initWatch(vm);
      }
    }

    function proxy(vm, target, key) {
      Object.defineProperty(vm, key, {
        // vm.name
        get: function get() {
          return vm[target][key]; //vm._data.name
        },
        set: function set(newValue) {
          vm[target][key] = newValue;
        }
      });
    }

    function initData(vm) {
      var data = vm.$options.data; // data可能是函数和对象

      data = typeof data === 'function' ? data.call(vm) : data; // console.log(data)
      // 对数据进行劫持 vue2 里采用了一个api defineProperty

      vm._data = data;
      observe(data); // 将vm._data用vm来代理就可以

      for (var key in data) {
        proxy(vm, '_data', key);
      }
    }

    function initComputed(vm) {
      var computed = vm.$options.computed;
      var watchers = vm._computedWatchers = {};

      for (var key in computed) {
        var userDef = computed[key]; // 需要监控计算属性中get的变化

        var fn = typeof userDef === 'function' ? userDef : userDef.get;
        watchers[key] = new Watcher(vm, fn, {
          lazy: true
        });
        defineComputed(vm, key, userDef);
      }
    }

    function initWatch(vm) {
      var watch = vm.$options.watch;

      for (var key in watch) {
        var handler = watch[key];

        if (Array.isArray(handler)) {
          for (var i = 0; i < handler.length; i++) {
            createWatcher(vm, key, handler[i]);
          }
        } else {
          createWatcher(vm, key, handler);
        }
      }
    }

    function createWatcher(vm, key, handler) {
      // 字符串 函数
      if (typeof handler === 'string') {
        handler = vm[handler];
      }

      return vm.$watch(key, handler);
    }

    function defineComputed(target, key, userDef) {
      var setter = userDef.set || function () {}; // 可以通过实例拿到对应的属性


      Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
      });
    }

    function createComputedGetter(key) {
      // 需要检查是否要执行这个getter
      return function () {
        var watcher = this._computedWatchers[key];

        if (watcher.dirty) {
          // 如果是脏的就去执行 用户传入的函数
          watcher.evaluate();
        }

        if (Dep.target) {
          // 计算属性出栈后，还有渲染watcher
          watcher.depend();
        }

        return watcher.value;
      };
    }

    function createElementVNode(vm, tag, data) {
      if (data == null) {
        data = {};
      }

      var key = data.key;

      if (key) {
        delete data.key;
      }

      for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        children[_key - 3] = arguments[_key];
      }

      return vnode(vm, tag, key, data, children);
    }
    function createTextVNode(vm, text) {
      return vnode(vm, undefined, undefined, undefined, undefined, text);
    }

    function vnode(vm, tag, key, data, children, text) {
      return {
        vm: vm,
        tag: tag,
        key: key,
        data: data,
        children: children,
        text: text
      };
    }
    /*
        1. ast做的是语法层面的转化，描述的是语法本身
        2. 虚拟DOM，描述的是DOM元素，可以增加一些自定义属性
    */

    function createElm(vnode) {
      var tag = vnode.tag,
          data = vnode.data,
          children = vnode.children,
          text = vnode.text;

      if (typeof tag === 'string') {
        // 标签
        // 将虚拟节点和真实节点对应起来
        vnode.el = document.createElement(tag); // 更新属性

        patchProps(vnode.el, data);
        children.forEach(function (child) {
          vnode.el.appendChild(createElm(child));
        });
      } else {
        vnode.el = document.createTextNode(text);
      }

      return vnode.el;
    }

    function patchProps(el, props) {
      for (var key in props) {
        if (key === 'style') {
          for (var styleName in props.style) {
            el.style[styleName] = props.style[styleName];
          }
        } else {
          el.setAttribute(key, props[key]);
        }
      }
    }

    function patch(oldVNode, vnode) {
      // 初始渲染流程
      var isRealElement = oldVNode.nodeType;

      if (isRealElement) {
        var elm = oldVNode; // 获取真实元素

        var parentElm = elm.parentNode; // 拿到父元素

        var newElm = createElm(vnode); // 生成新节点

        parentElm.insertBefore(newElm, elm.nextSibling); // 插入新节点

        parentElm.removeChild(elm); // 删除老节点

        return newElm;
      }
    }

    function initLifeCycle(Vue) {
      Vue.prototype._update = function (vnode) {
        // 将虚拟DOM转化成真实DOM
        var vm = this;
        var el = vm.$el; // patch既有初始化的功能，又有更新的功能

        vm.$el = patch(el, vnode);
      }; // _c('div', {}, ...children)


      Vue.prototype._c = function () {
        return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      }; // _v(text)


      Vue.prototype._v = function () {
        return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      };

      Vue.prototype._s = function (value) {
        if (_typeof(value) !== 'object') return value;
        return JSON.stringify(value);
      };

      Vue.prototype._render = function () {
        // 当渲染的时候去实例中取值，就可以将属性和试图绑在一起
        return this.$options.render.call(this);
      };
    }
    function mountComponent(vm, el) {
      vm.$el = el; // 1. 调用render 产生虚拟DOM

      var updateComponent = function updateComponent() {
        vm._update(vm._render());
      };

      new Watcher(vm, updateComponent, true); // vm.$options.render() 虚拟节点
      // 2. 根据虚拟DOM产生真实DOM
      // 3 插入到el元素中
    }
    function callHook(vm, hook) {
      // 调用钩子函数
      var handlers = vm.$options[hook];

      if (handlers) {
        handlers.forEach(function (handlers) {
          return handlers.call(vm);
        });
      }
    }

    function initMixin(Vue) {
      // 给Vue增加init方法
      Vue.prototype._init = function (options) {
        // 初始化操作
        var vm = this;
        vm.$options = mergeOptions(this.constructor.options, options); // 将用户的选项挂载到实例上

        callHook(vm, 'beforeCreate'); // 初始化状态,初始化计算属性

        initState(vm);
        callHook(vm, 'created');

        if (options.el) {
          // 实现数据的挂载
          vm.$mount(options.el);
        }
      };

      Vue.prototype.$mount = function (el) {
        var vm = this;
        el = document.querySelector(el);
        var ops = vm.$options;

        if (!ops.render) {
          // 先进行查找有没有render函数
          var template; // 没有render看一下是否写了template，没写template，采用外部的templat

          if (!ops.template && el) {
            //没有写模板，但是写了el
            template = el.outerHTML;
          } else {
            // 写了template，就用写了的template
            if (el) {
              template = ops.template;
            }
          } // 需要对模板进行编译


          if (template) {
            var render = compileToFunction(template);
            ops.render = render;
          }
        }

        mountComponent(vm, el); // 组件的挂载
        // 最终可以获取render方法
      };
    }

    function Vue(options) {
      // options用户的选项
      this._init(options);
    }

    Vue.prototype.$nextTick = nextTick;

    Vue.prototype.$watch = function (exprOrFn, cb) {
      // name
      // () => vm.name
      // name值变化，直接执行cb
      new Watcher(this, exprOrFn, {
        user: true
      }, cb);
    };

    initMixin(Vue);
    initLifeCycle(Vue);
    initGloablAPI(Vue);

    return Vue;

}));
//# sourceMappingURL=vue.js.map
