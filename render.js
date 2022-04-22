import { patch } from "./patch.js";

const options = {
  // 用于创建元素
  createElement(tag) {
    return document.createElement(tag)
  },
  // 设置元素文本节点
  setElementText(el, text) {
    el.textContent = text
  },
  // 插入元素
  insert(el, container) {
    container.appendChild(el)
  }
}

function createRenderer(options) {

  const {
    createElement,
    setElementText,
    insert
  } = options

  function render(vnode, container) {
    if (vnode) {
      // 新的vode存在，执行path
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        // 旧的存在，新的不存在，说明是卸载
        container.innerHTML = ''
      }
    }
    // 旧的vnode缓存
    container._vnode = vnode
  }

  export function patch(n1, n2, container) {
    if (!n1) {
      mountElement(n2, container)
    } else {
      //
    }
  }

  function mountElement(vnode, container) {
    const el = createElement(vnode.type)

    // 孩子节点处理
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    } else if (Array.isArray(vnode)) {
      vnode.children.forEach(child => {
        // 挂载阶段，没有旧vnode
        patch(null, child, el)
      })
    }

    if (vnode.props) {
      for (const key in vnode.props) {
        // class 做特殊处理。不管是对象，数组，还是字符串统一处理成字符串
        if (key === 'class') {
          // 暂时省略
          // normalizeClass()
        }

        // 用 in 操作符判断 key 是否存在对应的DOM property
        if (key in el) {
          const type = typeof el[key]
          const value = vnode.props[key]
          // 布尔类型，且value 为空，变为false。 参照disable
          if (type === 'boolean' && value === '') {
            el[key] = true
          } else {
            el[key] = value
          }
        } else{
          // 如果要设置的属性没有对应的 Dom properties。 如 class -> className，直接调用setAttribute。这里并不健全，直接用的原有的名字 class -> class
          el.setAttribute(key, vnode.props[key])
        }
      }
    }

    // 元素挂载到容器里
    insert(el, container)
  }

  return {
    render
  }
}

