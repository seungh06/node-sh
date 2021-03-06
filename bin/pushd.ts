import * as defined from 'internal/defined'
import { InternalError } from 'internal/exception'
import { UnixExtension } from 'internal/extension'
import { interpret } from 'internal/interpreter'

import { DIRECTORY_STACK, is_index, load_index, load_stacks } from 'binary/dirs'
import { cd } from 'binary/cd'

export const pushd_options: defined.binary_options = [
        {
                short: 'n', description: 'Suppresses the normal change of directory when adding\n directories to the stack, so only the stack is manipulated.'
        }
]

export const pushd: defined.asm<string[]> = (main, ...args) => {
        const { options, stdin } = interpret(pushd_options, main, args);

        if(stdin.length > 1) {
                throw new InternalError('-node: pushd: too many arguments.');
        }

        let stacks = load_stacks(), input = stdin[0];
        switch(true) {
                case input === '+0':
                        return new UnixExtension(stacks);
                
                case !input:
                        if(stacks.length <= 1) {
                                throw new InternalError('-node: pushd: no other directory.')
                        }

                        stacks = stacks.splice(1, 1).concat(stacks);
                        break;

                case is_index(input):
                        try {
                                const index = load_index(input);
                                stacks = stacks.splice(index, 1).concat(stacks);
                        } catch(error: any) {
                                throw new InternalError(error.message, undefined, 0, [ '-node', 'pushd' ]);
                        }
                        break;

                case options.n:
                        stacks.splice(1, 0, input);
                        break;

                default: 
                        stacks.unshift(input);
                        break;
        }

        if(!options.n) {
                try {
                        cd `${stacks.shift()}`
                } catch(error: any) {
                        throw new InternalError(error.message, undefined, 0, [ '-node', 'pushd' ]);
                }
        } else stacks = stacks.slice(1);

        DIRECTORY_STACK.splice(0, DIRECTORY_STACK.length, ...stacks);
        return new UnixExtension(load_stacks())
}