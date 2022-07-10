import * as defined from 'core/defined'
import { InternalError } from 'core/exception'
import { interpret } from 'core/interpreter'
import { UnixExtension } from 'core/extension'

import { DIRECTORY_STACK, load_index, load_stacks } from 'assm/dirs'
import { cd } from 'assm/cd'

export const popd_options: defined.sh_options = [
        {
                short: 'n', description: 'Suppresses the normal change of directory when removing\n directories from the stack, so only the stack is manipulated.'
        }
]

export const popd: defined.sh<string[]> = (main, ...args) => {
        const { options, stdin } = interpret(popd_options, main, args);

        if(stdin.length > 1) {
                throw new InternalError(`-node: popd: too many arguments.`);
        }

        if(DIRECTORY_STACK.length <= 0) {
                throw new InternalError(`-node: popd: directory stack empty.`);
        }

        try {
                let index = load_index(stdin[0] || '+0');
                if(options.n || index > 0 || DIRECTORY_STACK.length + index === 0) {

                        index = index > 0 ? index - 1 : index;
                        DIRECTORY_STACK.splice(index, 1);

                } else cd `${DIRECTORY_STACK.shift()}`
        } catch(error: any) {
                throw new InternalError(error.message, undefined, 0, [ '-node', 'popd' ]);
        }

        return new UnixExtension(load_stacks())
}