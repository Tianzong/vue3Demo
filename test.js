// 测试代码
import { reactive } from "./reactive.js"
import {computed, effects, budget} from "./effects.js"

// 测试代码
let obj = {
  name: 'tys',
  age: 20
}
const arr = ['foo']
const objReactive = reactive(obj)
const arrReactive = reactive(arr)
/**
 * 1. 基本响应式
 *
 * 更改属性，副作用函数是否重新执行？
 *
 * 预期:
 * 今年20, 我叫tys，
 * 今年21, 我叫tys，
 * 今年22, 我叫tys，
 * 今年22, 我叫哈哈
 * */
// effects(() => {
//   console.log(`今年${objReactive.age}, 我叫${objReactive.name}，`)
// })
//
// objReactive.age++
// objReactive.age++
// objReactive.name = '哈哈'


/**
 * 2. effect 嵌套
 *
 * effect嵌套的情况下能否正常工作？
 * 好像有点问题，同时修改 age 和 name的情况下
 *
 * 预期：
 * effectFn1 执行
 * effectFn2 执行
 * effectFn1 执行
 * effectFn2 执行
 * */
// let temp1, temp2
// effects(function effectFn1() {
//   console.log('effectFn1 执行')
//
//   effects(function effectFn2() {
//     console.log('effectFn2 执行')
//     temp1 = objReactive.name
//   })
//   temp2 = objReactive.age
// })
// objReactive.age++

/**
 * 3. effect 是否无限循环
 *
 * effect嵌套的情况下能否正常工作？
 *
 * 预期：
 * 20
 * */
// effects(() => {
//   console.log(objReactive.age++)
// })

/**
 * 4. computed
 *
 * 支持缓存。
 *
 * 预期：
 * 自我介绍: 我是tys今年20
 * 自我介绍: 我是tys今年21
 * 自我介绍: 我是tys今年22
 * */
//
// const intro = computed(() => {
//   return `我是${objReactive.name}` + `今年${objReactive.age}`
// })
//
// effects(() => {
//   console.log('自我介绍:', intro.value)
// })
//
// objReactive.age++
// objReactive.age++
// objReactive.age = objReactive.age

/**
 * 5. for in 拦截
 * */
// effects(() => {
//   console.log('name' in objReactive)
//   console.log('for in 拦截')
// })
//
// objReactive.add = 'new add'

/**
 * 5. 数组 length
 *
 * 预期：
 * foo
 * undefined
 * 0
 * 4
 * */
// effects(() => {
//   console.log(arrReactive[0])
// })
//
// arrReactive.length = 0
//
// effects(() => {
//   console.log(arrReactive.length)
// })
//
// arrReactive[3] = 'bar'

// effects(() => {
//   for (const val of arrReactive) {
//     console.log(val)
//   }
// })
//
// arrReactive[1] = 'bar'

/**
 * 6. 组件化
 *
 * 预期：
 * */
