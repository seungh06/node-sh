import * as defined from 'internal/definition'
import      register from 'internal/register'

export const echo_options = [
    [ 'n', '-', false ], [ 'e', '-', false ]
]

export const echo: defined.shx<string> = (main, ...args) => {
        const { options, inputs } = register(echo_options, main, args);
    
        const output = inputs.join(' ') + (options.n ? '\n' : '');
        return output;
}