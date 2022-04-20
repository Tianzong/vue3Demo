
import { reactive } from "./reactive.js";

// 代理原始值
function ref(val) {
  const wrapper = {
    value: val
  }

  Object.defineProperties(wrapper, '__v_isRef', {
    value: true
  })

  return reactive(wrapper)
}

// 防止响应丢失
// 当使用...操作符赋值给新的对象的时候，由于新对象不是代理对象，所以
// 读取key的时候，实际上读取的是，读取的是响应式对象的key
function toRef(obj, key) {
  const wrapper = {
    get value() {
      return obj[key]
    }
  }

  Object.defineProperties(wrapper, '__v_isRef', {
    value: true
  })

  return wrapper
}

function toRefs(obj) {
  const ret = {}
  for (const key in obj) {
    ret[key] = toRef(obj, key)
  }
  return ref
}

function toRefs(obj) {
  const ret = {}
  // for in 循环遍历
  for (const key in obj) {
    ret[key] = toRef(obj, key)
  }
  return ret
}