import * as defined from '../internal/defined'
import { interpret } from '../internal/interpreter'
import path from 'path/posix'
import stream from 'fs'
import { InternalError } from '../internal/exception'

export const mkdir_options: defined.sh_options = [
        {
                short: 'm', long: 'mode', input: 'MODE',
                description: 'set file mode (as in chmod), not a=rwx - umask'
        },

        {
                short: 'p', long: 'parents',
                description: 'no error if existing, make parent directories as needed'
        }
]

export const mkdir: defined.sh<void> = (main, ...args) => {
        const { options, stdin } = interpret(mkdir_options, main, args);
        
        stdin.forEach(function processor(input) {
                if(stream.existsSync(input)) {
                        throw new InternalError(`mkdir: cannot create directory \`${input}\`: is already exists.`, undefined, 2);
                }

                const parent = path.dirname(input);
                if(!stream.existsSync(parent) && !options.parents) {
                        throw new InternalError(`mkdir: cannot create directory \`${input}\`: no such file or directory.`, undefined, 2);
                }

                stream.mkdirSync(input, { recursive: options.parents, mode: options.mode });
        })
}