import * as defined from 'internal/defined'
import { InternalError } from 'internal/exception'
import { UnixExtension } from 'internal/extension'
import { interpret } from 'internal/interpreter'
import fs from 'node:fs'

export const head_options: defined.binary_options = [
        {
                short: 'c', long: 'bytes', input: 'NUM',
                description: 'print the first NUM bytes of each file;'
        },

        {
                short: 'n', long: 'lines', input: 'NUM',
                description: 'print the first NUM lines instead of the first 10;'
        },

        {
                short: 'q', long: [ 'quiet', 'silent' ],
                description: 'never print headers giving file names'
        }
]

export const head: defined.asm<string> = (main, ...args) => {
        const { options, stdin } = interpret(head_options, main, args);

        const num = parseInt(options.lines || options.bytes) || 10;
        const sep = options.bytes ? '' : '\n';

        const res = stdin.map(function processor(input) {
                if(!fs.existsSync(input)) {
                        throw new InternalError(`head: cannot open \`${input}\` for reading: no such file or directory.`, undefined, 2);
                }

                if(fs.statSync(input).isDirectory()) {
                        throw new InternalError(`head: error reading \`${input}\`: is a directory.`, undefined, 2);
                }

                const content = fs.readFileSync(input, 'utf-8').split(sep);

                const head = options.q || stdin.length <= 1 ? '' : `==> ${input} <==\n`;
                return head + content.slice(0, num).join(sep);
        }).join(options.q ? '' : '\n\n');

        return new UnixExtension(res);
}