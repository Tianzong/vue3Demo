const budget = new WeakMap()

// 当前副作用函数
let activeEffect
// 副作用函数栈， effect 嵌套的时候，栈顶始终为当前执行的effect函数
const effectStack = []

// 注册副作用函数, 设fn修改了响应式对象obj
function effect(fn, options = {}) {
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

function computed(getter) {
  const effectFn = effect(getter, {
    lazy: true
  })

  const obj = {
    get value() {
      return effectFn()
    }
  }

  return obj
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
    depMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
  // 与副作用函数存在联系的依赖集合
  activeEffect.deps.push(deps)
}

// 派发更新
function trigger(target, key) {
  const depMap = budget.get(target)
  if (!depMap) {
    return
  }
  const effects = depMap.get(key)

  // 避免无限执行 ？？ 不大懂
  const effectsToRun = new Set(effects)

  effectsToRun && effectsToRun.forEach(effectFn =>  () => {
    // 如果trigger触发的函数是当前effect函数则不执行
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
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

// 测试代码
let obj = {
  name: 'tys',
  age: 20
}
const objReactive = reactive(obj)

const intro = computed(() => objReactive.name + objReactive.age)
console.log(intro.value)


