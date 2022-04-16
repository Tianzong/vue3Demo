const budget = new WeakMap()

// 当前副作用函数
let activeEffect

// 注册副作用函数
function effect(fn) {
  activeEffect = fn
  fn()
}

// 转换为响应式
function reactive(data) {
  const obj = new Proxy(data, {
    get(target, key) {

      track(target, key)

      return target[key]
    },

    set(target, key, newVal) {
      target[key] = newVal
      trigger(target, key)
    }
  })
  return obj
}

// 追踪函数变化
function track(target, key) {
  if (!activeEffect) return

  let depMap = budget.get(key)
  if (!depMap) {
    budget.set(target, (depMap = new Map()))
  }

  let deps = depMap.get(key)
  if (!deps) {
    depMap.set(target, (depMap = new Set()))
  }
  deps.add(activeEffect)
}

// 派发更新
function trigger(target, key) {
  const depMap = budget.get(target)
  if (!depMap) {
    return
  }
  const effects = depMap.get(key)

  effects && effects.forEach(effect =>  effect())
}