
const FunctionDeclNode = {
  type: 'FunctionDecl',
  id: {
  }
}

const state = {
  initial: 1,
  tagOpen: 2,
  tagName: 3,
  text: 4,
  tagEnd: 5,
  tagEndName: 6
}

function isAlpha(char) {
  return char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z'
}

function dump(node, index = 0) {
  const type = node.type

  const desc = type === 'Root' ? ''
      : type === 'Element' ? 'Element' : 'Text'

  console.log(`${'-'.repeat(index)}${desc}`)

  if (node.children) {
    node.children.forEach(n => dump(node, index + 2))
  }
}

export function tokenizer(str) {
  let curState = state.initial
  // 缓存字符
  const chars = []
  // 生成的token
  const tokens = []

  while (str) {
    // 查看第一个字符
    const char = str[0]
    switch (curState) {
      case state.initial:
        if (char === '<') {
          // 遇到 < 标签开始了
          curState = state.tagOpen
          // 消费字符
          str = str.slice(1)
        } else if (isAlpha(char)) {
          // 1. 遇到字母 切换到文本状态
          curState = state.text
          chars.push(char)
          str = str.slice(1)
        }
        break
      case state.tagOpen:
        if (isAlpha(char)) {
          // 遇到字母 切换到标签名称状态
          curState = state.tagName
          chars.push(char)
          str = str.slice(1)
        } else if (char === '/') {
          curState = state.tagEnd
          str = str.slice(1)
        }
        break
      case state.tagName:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        } else if (char === '>') {
          // 切换为初始
          curState = state.initial
          // 2. 创建 一个标签token
          tokens.push({
            type: 'tag',
            name: chars.join('')
          })
          // chars 消费
          chars.length = 0
          str = str.slice(1)
        }
        break
      case state.text:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        } else if (char === '<') {
          curState = state.tagOpen
          tokens.push({
            type: 'text',
            content: chars.join('')
          })
          // chars 消费
          chars.length = 0
          str = str.slice(1)
        }
        break
      case state.tagEnd:
        if (isAlpha(char)) {
          curState = state.tagEndName
          chars.push(char)
          str = str.slice(1)
        }
        break
      case state.tagEndName:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        } else if (char === '>') {
          curState = state.initial
          tokens.push({
            type: 'tagEnd',
            name: chars.join('')
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
    }
  }

  return tokens
}

export function parse(str) {
  const tokens = tokenizer(str)

  const root = {
    type: 'Root',
    children: []
  }

  const eleStack = [root]

  while (tokens.length) {
    // 栈顶 为父节点
    const parent = eleStack[eleStack.length - 1]
    const t = tokens[0]
    switch (t.type) {
      case 'tag':
        const elementNode = {
          type: 'Element',
          tag: t.name,
          children: []
        }
        // 添加到父亲中
        parent.children.push(elementNode)
        eleStack.push(elementNode)
        break
      case 'text':
        const textNode = {
          type: 'Text',
          content: t.content
        }
        parent.children.push(textNode)
        break
      case 'tagEnd':
        eleStack.pop()
        break
    }
    tokens.shift()
  }

  return root
}

function traverseNode(ast, context) {
  const currentNode = ast
  const exitFns = []

  const transformers = context.nodeTransforms
  for (let i = 0; i < transformers.length; i++) {
    const onExit = transformers[i](currentNode, context)
    if (onExit) {
      exitFns.push(onExit)
    }
    if (!context.currentNode) return
  }

  const children = currentNode.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      context.parent = context.currentNode
      context.childIndex = i
      traverseNode(children[i])
    }
  }

  // 依次退栈执行回调函数
  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }
}

function transform(ast) {
  const context = {
    currentNode: null,
    // 替换节点 AST -> JS AST
    replaceNode (node) {
      context.parent.children[context.childIndex] = ind
      // 替换为 JS AST
      context.currentNode = node
    },
    nodeTransforms: [
        transformElement,
    ]
  }
}

function transformElement(ast, context) {
  //

  // 返回回调函数
  return () => {

  }
}
