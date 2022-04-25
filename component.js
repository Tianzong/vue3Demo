import { reactive } from "./reactive.js";
import {effects} from "./effects.js";

export function mountComponent(vnode, container, anchor) {
  const componentOptions = vnode.type
  const { render, data } = componentOptions

  const state = reactive(data())

  // 自动更新
  effects(() => {
    // 调用 render 函数的时候， 将其this设置为state。
    // 此时，函数内部可以通过this访问data
    const subTree = render.call(state, state)
    patch(null, subTree, container, anchor)
  })

}