
import { track, trigger } from "./effects.js"

export const ITERATE_KEY = Symbol()

export function reactive(obj, isShallow = false) {
  return new Proxy(obj, {
    // 代理读操作
    get(target, key, receiver) {

      // 递归代理
      // 得到原始值结果
      track(target, key)

      const res = Reflect.get(target, key, receiver)

      // 如果是浅响应 直接返回
      if (isShallow) return res

      if (typeof res === 'object' && res !== null) {
        // 懒代理， 用到的时候再代理
        return reactive(res)
      }
      return res
    },

    // 读操作
    set(target, key, newVal, receiver) {
      const oldVal = target[key]

      // 如果属性不存在，说明是在添加新的属性，否则是设置已有属性
      const type = Array.isArray(target)
          // 如果代理目标是 数组 设置的 下标（key）如果比原始长度大， 说明是新增，length变化
          ? (Number(key) < target.length ? 'SET' : 'ADD')
          : Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'

      const res = Reflect.set(target, key, newVal, receiver)
      // 考虑NAN. 当不全等的情况下下，抱枕都不是NAN
      if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
        trigger(target, key, type, newVal)
      }

      return res
    },

    // 代理in操作
    has(target, key) {
      track(target, key)
      return Reflect.has(target, key)
    },

    // 代理 for in 操作符
    ownKeys(target) {
      track(target, Array.isArray ? 'length': ITERATE_KEY)
      return Reflect.ownKeys(target)
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

// 暂时省略
export function shallowReadonly(obj) {

}

