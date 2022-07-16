import * as defined from 'internal/defined'
import { InternalError } from 'internal/exception'
import { UnixExtension } from 'internal/extension'
import { interpret } from 'internal/interpreter'
import fs from 'node:fs'

export const cat_options: defined.binary_options = [
        {
                short: 'n', long: 'number',
                description: 'number all output lines'
        },

        {
                short: 'E', long: 'show-ends',
                description: 'display $ at end of each line'
        },

        {
                short: 'T', long: 'show-tabs',
                description: 'display TAB characters as ^I'
        }
]

export const cat: defined.asm<string> = (main, ...args) => {
        const { options, stdin } = interpret(cat_options, main, args);

        const res = stdin.reduce<string>(function processor(output, input) {
                if(!fs.existsSync(input)) {
                        throw new InternalError(`cat: \`${input}\`: no such file or directory.`, undefined, 2);
                }

                if(fs.statSync(input).isDirectory()) {
                        throw new InternalError(`cat: \`${input}\`: is a directory.`, undefined, 2);
                }

                const raw = fs.readFileSync(input, 'utf-8').replaceAll('\r', '');
                return output + ( options.show_tabs ? raw.replace(/\t/g, ' ^I') : raw);
        }, '')

        if(!options.number && !options.show_ends) return new UnixExtension(res);

        const display = res.split('\n').map(function mapper(value, index) {
                const number = options.number ? `${ index + 1 }`.padStart(6) + '\t' : '';
                const ends = options.show_ends ? '$' : '';

                return number + value + ends;
        }).join('\n');

        return new UnixExtension(display);
}