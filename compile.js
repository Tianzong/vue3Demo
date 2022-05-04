import { parse, tokenizer, transform, generate } from './parse.js'

const template = '<div><p>Vue</p><p>Template</p></div>'

function compiler(template) {
  // 模板 AST
  const ast = parse(template)
  // AST -> JS AST
  transform(ast)
  // 代码生成
  const code = generate(ast.jsNode)
}