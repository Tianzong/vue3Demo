import { patch } from "./patch.js";
import { mountComponent } from './component.js'

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
  insert(el, container, anchor) {
    container.appendChild(el, anchor)
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
        unmount(vnode)
      }
    }
    // 旧的vnode缓存
    container._vnode = vnode
  }

  // 封装卸载操作。可用于钩子函数的监听
  function unmount(vnode) {
    const parent = vnode.el.parentNode
    if (parent) {
      parent.removeChild(vnode.el)
    }
  }

  function patch(n1, n2, container, anchor) {
    // 不同类型，先卸载旧的
    if (n1 && n1.type !== n2.type) {
      unmount(n1)
      n1 = null
    }
    
    const { type } = n2
    
    // string 代表普通标签
    if (typeof type === 'string') {
      if (!n1) {
        mountElement(n2, container, anchor)
      } else {
        patchElement(n1, n2)
      }
    } else if (type === 'object') {
      // 组件类型
      mountComponent()
    } else if (type === Text) {
      // 文本类型
      // 如果没有旧节点，直接挂载
      if (!n1) {
        const el = n2.el = document.createTextNode(n2.children)
        insert(el, container)
      } else {
        const el = n2.el = n1.el
        if (n1.children && n2.children) {
          el.nodeValue = n2.children
        }
      }
    }

    if (!n1) {
      mountElement(n2, container)
    } else {
      //
    }
  }

  // 毕竟两个元素，更新
  function patchElement(n1, n2) {
    // ??
    const el = n2.el = n1.el
    const oldProps = n1.props
    const newProps = n2.props

    // patch Props
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        patchProps(el, key, oldProps[key], newProps[key])
      }
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        patchProps(el, key, oldProps[key], newProps[key])
      }
    }

    // 更新children
    patchChildren(n1, n2, el)
  }

  function patchChildren(n1, n2, container) {
    // 新节点是 文本标签
    if (typeof n2.children === 'string') {
      // 旧节点类型： 没有子节点，文本子节点，一组子节点
      // 只有为一组(可能为1)子节点的时候才要卸载
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c))
      }
      // 将新的设置到容器下面
      setElementText(container, n2.children)
    } else if (Array.isArray(n2.children)) {
      // 新节点是一组子节点

      const oldChildren = n1.children
      const newChildren = n2.children

      // 旧 长度
      const oldLen = oldChildren.length
      const newLen = newChildren.length

      // 较短的长度
      const commonLength = Math.min(oldLen, newLen)

      // 当前找到的 key相同的 旧节点的ind最大值
      // 依次遍历新的节点。 每次寻找相同旧节点的 index 如果小于该值。 直接放到上一个匹配到的旧节点的后面
      let lastIndex = 0

      // 使用key 先patch可复用的节点
      for (let i = 0; i < newChildren.length; i++) {
        const newVNode = newChildren[i]
        let j = 0
        // 是否找到了相同得key
        let find = false

        for (j; j < oldChildren.length; j++) {
          const oldVNode = oldChildren[i]
          const has = newChildren.find(vnode => vnode.key === oldVNode.key)

          // 如果没找到一样的
          if (!has) {
            unmount(oldVNode)
          }

          if (newVNode.key === oldVNode.key) {
            find = true
            patch(oldVNode, newVNode, container)
            if (j < lastIndex) {
              // 如果当前找到的节点，在旧节点中得index小于最大索引值 说明他需要移动
              // 其实就是插入排序
              const preVnode = newChildren[i - 1]
              if (preVnode) {
                const anchor = preVnode.el.nextSibling
                insert(newVNode.el, container, anchor) // 插入到container里得anchor前
              }
            } else {
              lastIndex = j
            }
            break
          }
        }
        // find 为false
        // 说明新增 直接插到新得上一个下面
        if (!find) {
          const prevVnode = newChildren[i - 1]
          let anchor = null
          if (prevVnode) {
            // 用下一个兄弟做锚点
            anchor = prevVnode.el.nextSibling
          } else {
            // 没有前一个直接插入到container第一个
            anchor = container.firstChild
          }
          patch(null, newVNode, container, anchor)
        }
      }

      /// 遍历接的节点。
      for (let i = 0; i < commonLength; i++) {
        patch(oldChildren[i], newChildren[i])
      }

      if (newLen > oldLen) {
        for (let i = commonLength; i < newLen; i++) {
          patch(null, newChildren[i], container)
        }
      } else {
        unmount(oldChildren[i])
      }

    }
  }

  function mountElement(vnode, container, anchor) {
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
        patchProps(el, key, null, vnode.props[key])
      }
    }

    // 元素挂载到容器里
    insert(el, container)
  }

  function patchProps(el, key, prevValue, nextValue) {
    // 如果是事件监听器
    if (/^on/.test(key)) {
      const name = key.slice(2).toLowerCase()
      // 移除旧的事件处理函数
      prevValue && el.removeEventListener(name, prevValue)
      el.addEventListener(name, nextValue)
    } else if (key === 'class') {
      // 暂时省略
      // class 做特殊处理。不管是对象，数组，还是字符串统一处理成字符串  --> "class1 class2"
      // normalizeClass()
    } else if (shouldSetAsProps(el, key, nextValue)) {
      // 用 in 操作符判断 key 是否存在对应的DOM property
      if (key in el) {
        const type = typeof el[key]
        // 布尔类型，且value 为空，变为false。 参照disable
        if (type === 'boolean' && nextValue === '') {
          el[key] = true
        } else {
          el[key] = nextValue
        }
      } else{
        // 如果要设置的属性没有对应的 Dom properties。 如 class -> className，直接调用setAttribute。这里并不健全，直接用的原有的名字 class -> class
        el.setAttribute(key, nextValue)
      }
    } else {
      // 省略
    }
  }

  // 是否支持设置props。
  function shouldSetAsProps(el, key, value) {
    // 特殊处理
    if (key === 'form' && el.tagName === 'INPUT') return false

    return key in el
  }

  return {
    render
  }
}

