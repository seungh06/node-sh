import * as path     from 'path'
import * as stream   from 'fs'
import * as defined  from 'internal/definition'
import      register from 'internal/register'
import      ShxError from 'internal/shx-error'

export const mkdir_options = [
        [ 'm', 'mode', true ], [ 'p', 'parents', false ]
]

export const mkdir: defined.shx<void> = (main, ...args) => {
        const { options, inputs } = register(mkdir_options, main, args);

        for(const input of inputs) {
                if(stream.existsSync(input)) {
                        throw new ShxError(`${input} is already exists.`, 'node-sh');
                }

                const parent = path.dirname(input);
                if(!stream.existsSync(parent) && !options.parents) {
                        throw new ShxError(
                                `no such file or directory: ${parent}.`, 'node-sh',
                                'Please enter an existing path.'
                        )
                }

                stream.mkdirSync(input, {
                        recursive: options.parents, mode: parseInt(options.mode) || '777'
                })
        }
}