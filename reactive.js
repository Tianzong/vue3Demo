const budget = new WeakMap()

// 当前副作用函数
let activeEffect
// 副作用函数栈， effect 嵌套的时候，栈顶始终为当前执行的effect函数
const effectStack = []

// 注册副作用函数, 设fn修改了响应式对象obj
function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(activeEffect)
    fn()
    // 执行完毕后弹出
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
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
  name: 'tys',
  age: 20
}
const objReactive = reactive(obj)


effect(function effectFun1(){

  effect(function effectFn2() {
    console.log('effect2 执行', objReactive.age)
  })

  console.log('effect1 执行', objReactive.name)
})

objReactive.name = 'world'
