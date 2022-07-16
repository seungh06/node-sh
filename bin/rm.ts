import * as defined from 'internal/defined'
import { InternalError } from 'internal/exception'
import { interpret } from 'internal/interpreter'
import fs from 'node:fs'

export const rm_options: defined.binary_options = [
        {
                short: 'f', long: 'force',
                description: 'ignore nonexistent files and arguments, never prompt'
        },

        {
                short: 'r', long: 'recursive',
                description: 'remove directories and their contents recursively'
        }
]

export const rm: defined.asm<void> = (main, ...args) => {
        const { options, stdin } = interpret(rm_options, main, args);

        stdin.forEach(function processor(input) {
                if(!fs.existsSync(input)) {
                        throw new InternalError(`rm: cannot remove \`${input}\`: no such file or directory.`, undefined, 2);
                }

                const stat = fs.lstatSync(
                        input.endsWith('/') ? input.slice(0, -1) : input
                );
                const type = stat.isFile() ? 'FILE' : stat.isDirectory() ? 'DIRECTORY'
                        : stat.isSymbolicLink() ? 'SYMINK' : stat.isFIFO() ? 'FIFO' : 'UNKNOWN';

                switch(type) {
                        case 'FILE':
                                fs.access(input, fs.constants.W_OK, exception => {
                                        if(exception && !options.force) {
                                                throw new InternalError(`rm: failed to remove \`${input}\`: permission denied.`, undefined, 2);
                                        }
        
                                        fs.unlinkSync(input);
                                })
                                break;
                                
                        case 'DIRECTORY':
                                if(!options.recursive) {
                                        throw new InternalError(
                                                `rm: cannot remove directory \`${input}\`: directory not empty.`,
                                                'if you want to remove recursivly, please use -r or --recursive options.', 2
                                        )
                                }
        
                                fs.rmSync(input, {
                                        recursive: true, force: options.force || false
                                })
                                break;
        
                        case 'FIFO':
                                fs.unlinkSync(input);
                                break;
        
                        case 'SYMINK':
                                const stat = fs.statSync(input);
        
                                if(stat.isDirectory() && input.endsWith('/')) {
                                        if(!options.recursive) {
                                                throw new InternalError(
                                                        `rm: cannot remove directory \`${input}\`: directory not empty.`,
                                                        'if you want to remove recursivly, please use -r or --recursive options.', 2
                                                )
                                        }
        
                                        fs.rmSync(input, {
                                                recursive: true, force: options.force || false
                                        })
                                } else fs.unlinkSync(input);
                                break;
                }
        })
}