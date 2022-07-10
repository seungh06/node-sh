import * as defined from 'internal/defined'
import { interpret } from 'internal/interpreter'
import stream from 'fs'
import { InternalError } from 'internal/exception'

export const rm_options: defined.sh_options = [
        {
                short: 'f', long: 'force',
                description: 'ignore nonexistent files and arguments, never prompt'
        },

        {
                short: 'r', long: 'recursive',
                description: 'remove directories and their contents recursively'
        }
]

export const rm: defined.sh<void> = (main, ...args) => {
        const { options, stdin } = interpret(rm_options, main, args);

        stdin.forEach(function processor(input) {
                if(!stream.existsSync(input)) {
                        throw new InternalError(`rm: cannot remove \`${input}\`: no such file or directory.`, undefined, 2);
                }

                const stat = stream.lstatSync(
                        input.endsWith('/') ? input.slice(0, -1) : input
                );
                const type = stat.isFile() ? 'FILE' : stat.isDirectory() ? 'DIRECTORY'
                        : stat.isSymbolicLink() ? 'SYMINK' : stat.isFIFO() ? 'FIFO' : 'UNKNOWN';

                switch(type) {
                        case 'FILE':
                                stream.access(input, stream.constants.W_OK, exception => {
                                        if(exception && !options.force) {
                                                throw new InternalError(`rm: failed to remove \`${input}\`: permission denied.`, undefined, 2);
                                        }
        
                                        stream.unlinkSync(input);
                                })
                                break;
                                
                        case 'DIRECTORY':
                                if(!options.recursive) {
                                        throw new InternalError(
                                                `rm: cannot remove directory \`${input}\`: directory not empty.`,
                                                'if you want to remove recursivly, please use -r or --recursive options.', 2
                                        )
                                }
        
                                stream.rmSync(input, {
                                        recursive: true, force: options.force || false
                                })
                                break;
        
                        case 'FIFO':
                                stream.unlinkSync(input);
                                break;
        
                        case 'SYMINK':
                                const stat = stream.statSync(input);
        
                                if(stat.isDirectory() && input.endsWith('/')) {
                                        if(!options.recursive) {
                                                throw new InternalError(
                                                        `rm: cannot remove directory \`${input}\`: directory not empty.`,
                                                        'if you want to remove recursivly, please use -r or --recursive options.', 2
                                                )
                                        }
        
                                        stream.rmSync(input, {
                                                recursive: true, force: options.force || false
                                        })
                                } else stream.unlinkSync(input);
                                break;
                }
        })
}