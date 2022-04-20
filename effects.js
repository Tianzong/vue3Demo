import { ITERATE_KEY } from "./reactive.js";

export const budget = new WeakMap()

// 当前副作用函数
let activeEffect
// 副作用函数栈， effects 嵌套的时候，栈顶始终为当前执行的effect函数
const effectStack = []

// 注册副作用函数, 设fn修改了响应式对象obj
export function effects(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(activeEffect)
    const res = fn()
    // 执行完毕后弹出
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }
  effectFn.deps = []
  effectFn.options = options
  // 当非lazy的时候才执行，
  if (!options.lazy) {
    effectFn()
  }
  // lazy 将副作用函数返回
  return effectFn
}

export function computed(getter) {
  // 上一次的 缓存值
  let value
  // dirty 用于判断是否需要重新计算
  let dirty = true

  const effectFn = effects(getter, {
    lazy: true,
    scheduler() {
      // 当值变化的时候，重新标记为脏数据
      dirty = true
      // 这个值变化得时候，强制触发
      trigger(obj, 'value')
    }
  })

  const obj = {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      // 当读取value时， 手动调用track 函数进行追踪 将用到这个computed的effect进行追踪
      track(obj,'value')
      return value
    }
  }

  return obj
}

// 追踪函数变化
export function track(target, key) {
  if (!activeEffect) return

  let depMap = budget.get(target)
  if (!depMap) {
    budget.set(target, (depMap = new Map()))
  }

  let deps = depMap.get(key)
  if (!deps) {
    depMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
  // 与副作用函数存在联系的依赖集合
  activeEffect.deps.push(deps)
}

// 派发更新
export function trigger(target, key, type, newVal) {
  const depMap = budget.get(target)
  if (!depMap) {
    return
  }

  const effects = depMap.get(key)

  // 避免无限执行 ？？ 不大懂
  const effectsToRun = new Set()

  // 与 key 相关联的副作用函数
  effects && effects.forEach(effectFn => {
    // 如果trigger触发的函数是当前effect函数则不执行. 避免无限执行
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })

  // 与 属性枚举。 设置属性也会影响 for in 操作
  if (type === 'ADD' || type === 'DELETE') {
    // 取得与 ITERATE_KEY有关的副作用函数
    const iterateEffects = depMap.get(ITERATE_KEY)

    iterateEffects && iterateEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  }

  // 当操作类型是 ADD 并且目标是数组的情况下， 取出与length属性有关的effect
  if (type === 'ADD' && Array.isArray(target)) {
    const lengthEffects = depMap.get('length')

    lengthEffects && lengthEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  }

  // 当目标是数组，并且修改了 length. 需要将 key 大于等于 length的回调执行，因为他们现在是没有意义的值了
  if (Array.isArray(target) && key === 'length') {
    depMap.forEach((effects, key) => {
      if (key >= newVal) {
        effects.forEach(effectFn => {
          if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn)
          }
        })
      }
    })
  }

  // 执行副作用函数
  effectsToRun.forEach(effectFn => {
    // 如果该副作用函数 存在调度器 则调用该调度器，并且将该副作用函数作为参数传入
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}

// 双向删除该副作用函数的依赖关系
function cleanup(effectFn) {
  for (let i = 0; i < effectFn.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}




