
const ITERATE_KEY = Symbol()

function reactive(obj) {
  return new Proxy(obj, {
    // 代理读操作
    get(target, key, receiver) {
      track(target, key)
      return Reflect.get(target, key, receiver)
    },

    // 代理in操作
    has(target, key) {
      console.log(track())
      track(target, key)
      return Reflect.has(target, key)
    },

    // 代理 for in 操作符
    ownKeys(target) {
      track(target, ITERATE_KEY)
      return Reflect.ownKeys(target)
    }
  })
}

