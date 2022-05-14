import * as stream   from 'fs'
import * as defined  from 'internal/definition'
import      register from 'internal/register'
import      ShxError from 'internal/shx-error'

export const cat_options = [
        [ 'n', 'number', false ]
]

export const cat: defined.shx<string> = (main, ...args) => {
        const { options, inputs } = register(cat_options, main, args);

        let res = '';
        for(const input of inputs) {
                if(!stream.existsSync(input)) {
                        throw new ShxError(
                                `no such file or directory: ${input}.`, 'node-sh',
                                'Please enter an existing path.'
                        );
                } 
        
                if(stream.statSync(input).isDirectory()) {
                        throw new ShxError(
                                `${input} is a directory.`, 'node-sh',
                                'Please enter a file path, not a directory.'
                        )
                }

                res += stream.readFileSync(input, 'utf-8');
        }

        if(options.number) {
                res = res.split('\n').map(
                        function mapper(input, index) {
                                return (`     ${index + 1}`).slice(-6) + '\t' + input;
                        }
                ).join('\n')
        }

        return res;
}