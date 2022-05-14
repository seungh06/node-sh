import './node-sh'

$.cd `src`
const head = $.head `-q shx/which.ts`
console.log(head)