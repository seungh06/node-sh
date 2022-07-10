import * as defined from '../internal/defined'
import { InternalError } from '../internal/exception'
import { interpret } from '../internal/interpreter'
import stream from 'fs'
import { UnixExtension } from '../internal/extension'

export const tail_options: defined.sh_options = [
        {
                short: 'c', long: 'bytes', input: '[+]NUM',
                description: 'output the last NUM bytes; or use -c +NUM to\n output starting with byte NUM of each file'
        },

        {
                short: 'n', long: 'lines', input: '[+]NUM',
                description: 'output the last NUM lines, instead of the last 10;\n or use -n +NUM to output starting with line NUM'
        },

        {
                short: 'q', long: [ 'quiet', 'silent' ],
                description: 'never output headers giving file names'
        }
]

export const tail: defined.sh<string> = (main, ...args) => {
        const { options, stdin } = interpret(tail_options, main, args);

        const num = parseInt(options.lines || options.bytes) || 10;
        const sep = options.bytes ? '' : '\n';
        const pnv = (options.lines || options.bytes)?.[0] === '+';
        
        const res = stdin.map(function processor(input) {
                if(!stream.existsSync(input)) {
                        throw new InternalError(`tail: cannot open \`${input}\` for reading: no such file or directory.`, undefined, 2);
                }

                if(stream.statSync(input).isDirectory()) {
                        throw new InternalError(`tail: error reading \`${input}\`: is a directory.`, undefined, 2);
                }

                const content = stream.readFileSync(input, 'utf-8').split(sep);
                const value   = pnv ? num - 1 : -1 * Math.abs(num);
                
                const head = options.q || stdin.length <= 1 ? '' : `==> ${input} <==\n`;
                return head + content.slice(value).join(sep)
        }).join(options.q ? '' : '\n\n');

        return new UnixExtension(res)
}