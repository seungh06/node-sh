import * as path     from 'path'
import * as stream   from 'fs'
import * as defined  from 'internal/definition'
import      register from 'internal/register'

export const which_options = [
        [ 'a', 'all', false ]
]

export const which: defined.shx<string | string[]> = (main, ...args) => {
        const { options, inputs } = register(which_options, main, args);

        const sep = defined.isWindows ? ';' : ':' ;
        const env = [ 
            defined.isWindows ? process.cwd() : '', ...(process.env.PATH || '').split(sep)
        ]

        const extensions = (defined.isWindows ? process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD' : '')
                .toLowerCase().split(sep);
                
        if (defined.isWindows && inputs[0].includes('.') && extensions[0] !== '') extensions.unshift('');

        const matches: Array<string> = [ ];
        for(const segment of env) {
                const parent = path.join(segment, inputs[0]);
                extensions.forEach(extension => {
                        const path = parent + extension;
                        if(stream.existsSync(path) && stream.statSync(path).isFile()) {
                                matches.push(path);
                        }
                })
        }

        return options.all ? matches : matches[0];
}
