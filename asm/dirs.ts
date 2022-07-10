import * as defined from '#internal/defined'
import { InternalError } from '#internal/exception'
import { UnixExtension } from '#internal/extension'
import { interpret } from '#internal/interpreter'

export const dirs_options: defined.sh_options = [
        {
                short: 'c', description: 'clear the directory stack by deleting all of the elements'
        }
]

export const dirs: defined.sh<string[]> = (main, ...args) => {
        const { options, stdin } = interpret(dirs_options, main, args);

        if(options.c) {
                DIRECTORY_STACK.splice(0, DIRECTORY_STACK.length) // clear stacks
                return new UnixExtension(DIRECTORY_STACK);
        }

        const stacks = load_stacks(), input = stdin[stdin.length - 1];
        if(input) {
                try {
                        const index = load_index(input);
                        return new UnixExtension([ stacks[
                                index < 0
                                        ? stacks.length - index
                                        : index
                        ] ])
                } catch(error: any) {
                        throw new InternalError(error.message, undefined, 0, [ '-node', 'dirs' ]);
                }
        }

        return new UnixExtension(stacks);
}


export const DIRECTORY_STACK: Array<string> = [ ];

export const load_stacks = () => {
        return [ process.cwd() ].concat(DIRECTORY_STACK);
}

export const is_index = (input: string) => {
        return /^[-+]\d+$/.test(input);
}

export const load_index = (input: string) => {
        if(!is_index(input)) throw new Error(`${input}: invalid input.`);

        if(Math.abs(parseInt(input)) < DIRECTORY_STACK.length + 1) {
                return /^-/.test(input) ? Number(input) - 1 : Number(input);   
        } else throw new Error(`${input}: directory stack index out of range.`);
}