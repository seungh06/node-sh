import * as defined  from 'internal/definition'
import * as path from 'path'

export const pwd: defined.unit<string> = () => path.resolve(process.cwd());