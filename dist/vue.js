(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
    var ncname = '[a-zA-Z_][\\w\\-\\.]*';
    var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
    var startTagOpen = new RegExp("^<".concat(qnameCapture));
    var startTagClose = /^\s*(\/?)>/;
    var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));

    function parseHTML(html) {
      // 解析一个删除一个
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

          var attr, end;

          while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            advance(attr[0].length);
            match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5]
            });
          }

          if (end) {
            advance(end[0].length);
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

          if (startTagMatch) {
            // 解析到开始标签
            // console.log(startTagMatch)
            continue;
          }

          var endTagMatch = html.match(endTag);

          if (endTagMatch) {
            advance(endTagMatch[0].length); // console.log(endTagMatch)

            continue;
          }
        }

        if (textEnd > 0) {
          var text = html.substring(0, textEnd); // 文本内容

          if (text) {
            advance(text.length); // console.log(text)
          }
        }
      } // console.log(html)

    } // 对模板进行编译处理


    function compileToFunction(template) {
      // 1. 将template转换成 ast语法树
      parseHTML(template); // 2. 生成render方法（render方法返回的结果就是 虚拟DOM）
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

        return result;
      };
    });

    var Observer = /*#__PURE__*/function () {
      function Observer(data) {
        _classCallCheck(this, Observer);

        // 给数据加了一个标识，如果数据上有__ob__，则说明这个属性被观测了
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

    function defineReactive(target, key, value) {
      // 闭包 属性劫持
      observe(value); // 对所有属性进行劫持

      Object.defineProperty(target, key, {
        get: function get() {
          // 取值的时候会执行get
          // console.log('用户取值了')
          return value;
        },
        set: function set(newValue) {
          // 修改的时候会执行set
          // console.log('用户设置值了')
          if (newValue === value) return;
          observe(newValue);
          value = newValue;
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

    function initState(vm) {
      var opts = vm.$options; // 获取所有的选项

      if (opts.data) {
        initData(vm);
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

    function initMixin(Vue) {
      // 给Vue增加init方法
      Vue.prototype._init = function (options) {
        // 初始化操作
        var vm = this;
        vm.$options = options; // 将用户的选项挂载到实例上
        // 初始化状态

        initState(vm);

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
        } // 最终可以获取render方法


        ops.render;
      };
    }

    function Vue(options) {
      // options用户的选项
      this._init(options);
    }

    initMixin(Vue);

    return Vue;

}));
//# sourceMappingURL=vue.js.map
