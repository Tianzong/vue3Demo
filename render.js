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
    }
  }

  function mountElement(vnode, container) {
    const el = createElement(vnode.type)
    // 文本节点
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    }

    // 元素挂载到容器里
    insert(el, container)
  }

  return {
    render
  }
}

