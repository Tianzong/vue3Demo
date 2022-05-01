import { parse, tokenizer } from './parse.js'

const template = '<div><p>Vue</p><p>Template</p></div>'

console.log(parse(template))