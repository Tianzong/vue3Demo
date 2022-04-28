import { reactive } from "./reactive.js";
import {effects} from "./effects.js";

// 任务缓存队列
const queue = new Set()
// 队列是否正在刷新
let isFlushing = false
// 为了生成一个微队列
const p = Promise.resolve()

function queueJob(job) {
  // 添加到队列
  queue.add(job)
  //
  if (!isFlushing) {
    // 避免重复刷新 ?? 为什么会重复刷新？
    isFlushing = true
    p.then(() => {
      try {
        queue.forEach(job => job())
      } finally {
        // 重置状态
        isFlushing = false
        queue.length = 0
      }
    })
  }
}


export function mountComponent(vnode, container, anchor) {
  const componentOptions = vnode.type
  const { render, data } = componentOptions

  const state =  reactive(data())

  // 自动更新
  effects(() => {
    // 调用 render 函数的时候， 将其this设置为state。
    // 此时，函数内部可以通过this访问data
    const subTree = render.call(state, state)
    patch(null, subTree, container, anchor)
  }, {
    scheduler: queue
  })
}

