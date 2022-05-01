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
        }
        // chars 消费
        chars.length = 0
        str = str.slice(1)
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

const tokens = tokenizer()