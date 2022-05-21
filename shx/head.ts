import * as stream   from 'fs'
import * as defined  from 'internal/definition'
import      register from 'internal/register'
import      ShxError from 'internal/shx-error'

export const head_options = [
        [ 'n', 'lines', true  ], [ 'c', 'bytes', true ], [ 'q', 'quiet', false  ]
]

export const head: defined.shx<string> = (main, ...args) => {
        const { options, inputs } = register(head_options, main, args);

        const num = parseInt(options.lines || options.bytes) || 10;
        const res : Array<string> = [ ];

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

                const content = stream.readFileSync(input, 'utf-8').split(options.bytes ? '' : '\n');
                const output  = options.quiet || inputs.length <= 1 ? content.slice(0, num)
                        : [ `\n===> ${input} <===` + ( options.bytes ? '\n' : '' ), ...content.slice(0, num) ];

                res.push(...output);
        }

        return res.join(options.bytes ? '' : '\n');
}