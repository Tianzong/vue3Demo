
import { track, trigger } from "./effects.js"

export const ITERATE_KEY = Symbol()

export function reactive(obj) {
  return new Proxy(obj, {
    // 代理读操作
    get(target, key, receiver) {
      track(target, key)
      return Reflect.get(target, key, receiver)
    },

    // 代理in操作
    has(target, key) {
      track(target, key)
      return Reflect.has(target, key)
    },

    // 代理 for in 操作符
    ownKeys(target) {
      track(target, ITERATE_KEY)
      return Reflect.ownKeys(target)
    },

    // 读操作
    set(target, key, newVal, receiver) {
      const oldVal = target[key]

      // 如果属性不存在，说明是在添加新的属性，否则是设置已有属性
      const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'

      const res = Reflect.set(target, key, newVal, receiver)
      // 考虑NAN. 当不全等的情况下下，抱枕都不是NAN
      if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
        trigger(target, key, type)
      }

      return res
    },

    // 删除操作
    deleteProperty(target, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(target, key)
      const res = Reflect.deleteProperty(target, key)

      if (res && hadKey) {
        trigger(target, key, 'DELETE')
      }

      return res
    }
  })
}

