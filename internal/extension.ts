import * as defined from './defined'
import { interpret } from './interpreter'

import { grep_options } from '../asm/grep'
import { head_options } from '../asm/head'
import { tail_options } from '../asm/tail'
import { uniq_options } from '../asm/uniq'
import { sort_options, default_sort, insentive_sort, numeric_sort } from '../asm/sort'

class _UnixExtension<T> {
        constructor(public readonly stdout: T) {
                const props = { ...get_prototypes(this), ...get_prototypes(stdout) }
                Object.setPrototypeOf(this, props) // merge prototypes -> typeof stdout + UnixExtension.
        }

        grep: defined.sh<string[]> = (main, ...args) => {
                const { options, stdin } = interpret(grep_options, main, args);

                const regex = new RegExp(stdin.shift() || '', options['ignore-case'] ? 'i' : '');
                const output: Array<string> = [];

                if(options.files_with_matches) {
                        output.push('(standard input)');
                } else {
                        for(const [ index, segment ] of this.get_stdout().split('\n').entries()) {
                                const match = segment.match(regex);

                                if(match && !options.invert_match || !match && options.invert_match) {
                                        const ln = options.line_number ? `${ index + 1 }:${segment}` : segment
                                        output.push(options.with_filename || options.recursive ? `(stardard input):${ln}` : ln);
                                }
                        }
                }
                
                return new UnixExtension(output);
        }

        head: defined.sh<string> = (main, ...args) => {
                const { options } = interpret(head_options, main, args);
                
                const num = parseInt(options.lines || options.bytes) || 10;
                const sep = options.bytes ? '' : '\n';

                const res = this.get_stdout().split(sep).slice(0, num).join(sep);
                return new UnixExtension(res);
        }

        tail: defined.sh<string> = (main, ...args) => {
                const { options } = interpret(tail_options, main, args);
                
                const num = parseInt(options.lines || options.bytes) || 10;
                const sep = options.bytes ? '' : '\n';

                const pnv = (options.lines || options.bytes)?.[0] === '+';
                const value   = pnv ? num - 1 : -1 * Math.abs(num);

                const res = this.get_stdout().split(sep).slice(value).join(sep);
                return new UnixExtension(res);
        }

        uniq: defined.sh<string> = (main, ...args) => {
                const { options } = interpret(uniq_options, main, args);

                const compare = (reference: string, compare: string) => {
                        return options.ignore_case 
                                ? reference.toLocaleLowerCase().localeCompare(compare.toLocaleLowerCase())
                                : reference.localeCompare(compare);
                }

                const res = this.get_stdout().split('\n')
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

        sort: defined.sh<string> = (main, ...args) => {
                const { options } = interpret(sort_options, main, args);

                const sorted = this.get_stdout().split('\n').sort(options.numeric_sort ? numeric_sort : options.ignore_case ? insentive_sort : default_sort);
                const res = (options.reverse ? sorted.reverse() : sorted).join('\n');
                return new UnixExtension(res);
        }

        private get_stdout() {
                if(this.stdout instanceof Array) {
                        return this.stdout.join('\n');
                } else return `${ this.stdout }`
        }
}

export function get_prototypes<T>(object: T) {
        const res    : Record<string, any> = {}
        const protos = Object.getOwnPropertyNames(Object.getPrototypeOf(object))

        for(const proto of protos) {
                const segment = object[proto as keyof typeof object]
                res[proto]    = segment instanceof Function ? segment.bind(object) : segment
        }
        return res
}

export type UnixExtension<T> = _UnixExtension<T> & T
export const UnixExtension: new <T>(stdout: T) => UnixExtension<T> = _UnixExtension as any