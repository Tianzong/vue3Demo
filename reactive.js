const budget = new WeakMap()

// 当前副作用函数
let activeEffect

// 注册副作用函数, 设fn修改了响应式对象obj
function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    fn()
  }
  effectFn.deps = []
  effectFn()
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

  effects && effects.forEach(effect =>  effect())
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
  name: 'tys'
}
const objReactive = reactive(obj)


function effectFun () {
  console.log(objReactive.name)
}

effect(effectFun)

objReactive.name = 'nihao'
objReactive.name = 'world'

