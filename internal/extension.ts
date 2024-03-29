import * as defined from 'internal/defined'
import { InternalError } from 'internal/exception'
import { interpret } from 'internal/interpreter'
import path from 'node:path'
import fs from 'node:fs'

import { grep_options } from 'binary/grep'
import { head_options } from 'binary/head' 
import { tail_options } from 'binary/tail'
import { uniq_options } from 'binary/uniq'
import { sort_options, default_sort, insentive_sort, numeric_sort } from 'binary/sort'

class _UnixExtension<T> {
        constructor(public readonly stdout: T) {
                const props = { ...get_prototypes(this), ...get_prototypes(stdout) }
                Object.setPrototypeOf(this, props) // merge prototypes -> typeof stdout + UnixExtension.
        }

        grep: defined.asm<string[]> = (main, ...args) => {
                const { options, stdin } = interpret(grep_options, main, args);

                const regex = new RegExp(stdin.shift() || '', options['ignore-case'] ? 'i' : '');
                const output: Array<string> = [];

                if(options.files_with_matches) {
                        output.push('(standard input)');
                } else {
                        for(const [ index, segment ] of this.load_stdout().split('\n').entries()) {
                                const match = segment.match(regex);

                                if(match && !options.invert_match || !match && options.invert_match) {
                                        const ln = options.line_number ? `${ index + 1 }:${segment}` : segment
                                        output.push(options.with_filename || options.recursive ? `(stardard input):${ln}` : ln);
                                }
                        }
                }
                
                return new UnixExtension(output);
        }

        head: defined.asm<string> = (main, ...args) => {
                const { options } = interpret(head_options, main, args);
                
                const num = parseInt(options.lines || options.bytes) || 10;
                const sep = options.bytes ? '' : '\n';

                const res = this.load_stdout().split(sep).slice(0, num).join(sep);
                return new UnixExtension(res);
        }

        tail: defined.asm<string> = (main, ...args) => {
                const { options } = interpret(tail_options, main, args);
                
                const num = parseInt(options.lines || options.bytes) || 10;
                const sep = options.bytes ? '' : '\n';

                const pnv = (options.lines || options.bytes)?.[0] === '+';
                const value   = pnv ? num - 1 : -1 * Math.abs(num);

                const res = this.load_stdout().split(sep).slice(value).join(sep);
                return new UnixExtension(res);
        }

        uniq: defined.asm<string> = (main, ...args) => {
                const { options } = interpret(uniq_options, main, args);

                const compare = (reference: string, compare: string) => {
                        return options.ignore_case 
                                ? reference.toLocaleLowerCase().localeCompare(compare.toLocaleLowerCase())
                                : reference.localeCompare(compare);
                }

                const res = this.load_stdout().split('\n')
                        .reduceRight<{ count: number, ln: string }[]>(function processor(output, line) {
                                if(output.length === 0) return [{ count: 1, ln: line }]
                        
                                const compared = compare(output[0].ln, line) === 0;
                                return compared ? [{ count: output[0].count + 1, ln: line }].concat(output.slice(1)) : [{ count: 1, ln: line }].concat(output);
                        }, [])
                        .filter(object => options.repeated ? object.count > 1 : true)
                        .map(object => (options.count ? `${object.count.toString().padStart(7)} ` : '') + object.ln)
                        .join('\n');

                return new UnixExtension(res);
        }

        sort: defined.asm<string> = (main, ...args) => {
                const { options } = interpret(sort_options, main, args);

                const sorted = this.load_stdout().split('\n').sort(options.numeric_sort ? numeric_sort : options.ignore_case ? insentive_sort : default_sort);
                const res = (options.reverse ? sorted.reverse() : sorted).join('\n');
                return new UnixExtension(res);
        }

        redirect(main: TemplateStringsArray, ...args: Array<any>) {
                const { stdin:
                        [ operator, target ]  
                } = interpret([ /* EMPTY OPTIONS */], main, args);

                const root = path.dirname(target);
                if(!fs.existsSync(root)) throw new Error(`-node: \`${ target }\`: No such file or directory`);

                switch(operator) {
                        case '>':
                                if(global.$.env.noclobber && fs.existsSync(target)) {
                                        throw new InternalError(`-node: \`${target}\`: cannot overwrite existing file`);
                                }
                
                                fs.writeFileSync(target, this.load_stdout());
                                break;

                        case '>>':
                                fs.appendFileSync(target, this.load_stdout());
                                break;
                }
        }
        
        private load_stdout() {
                return this.stdout instanceof Array ? this.stdout.join('\n') : `${ this.stdout }`
        }
}

export function get_prototypes<T> (object: T) {
        const res: Record<string, any> = { }
        const protos = Object.getOwnPropertyNames(Object.getPrototypeOf(object))

        for(const proto of protos) {
                const segment = object[proto as keyof typeof object]
                res[proto]    = segment instanceof Function ? segment.bind(object) : segment
        }

        return res
}

export type UnixExtension<T> = _UnixExtension<T> & T
export const UnixExtension: new <T>(stdout: T) => UnixExtension<T> = _UnixExtension as any