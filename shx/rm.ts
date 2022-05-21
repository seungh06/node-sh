import * as stream   from 'fs'
import * as defined  from 'internal/definition'
import      register from 'internal/register';
import      ShxError from 'internal/shx-error';

export const rm_options = [
        [ 'f', 'force', false ], [ 'r', 'recursive', false ], [ 'R', 'recursive', false ]
]

export const rm: defined.shx<void> = (main, ...args) => {
        const { options, inputs } = register(rm_options, main, args);

        for(const input of inputs) {
                if(!stream.existsSync(input)) {
                        throw new ShxError(
                                `no such file or directory: ${input}.`, 'node-sh',
                                'Please enter an existing path.'
                        )
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
                                                throw new ShxError(`permission denied: ${input}`, 'node-sh');
                                        }

                                        stream.unlinkSync(input);
                                })
                                break;

                        case 'DIRECTORY':
                                if(!options.recursive) {
                                        throw new ShxError(
                                            `rm: cannot remove directory '${input}'`, 'node-sh',
                                            'if you want to remove recursivly, please use -r or --recursive options.'
                                        )
                                }

                                stream.rmSync(input, { 
                                        recursive: options.recursive || false, force: options.force || false
                                });
                                break;

                        case 'FIFO':
                                stream.unlinkSync(input);
                                break;
                }
        }
}