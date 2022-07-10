import * as defined from 'internal/defined'
import { UnixExtension } from 'internal/extension'
import { interpret } from 'internal/interpreter'
import path from 'path/posix'
import stream from 'fs'

export const which_options: defined.sh_options = [
        {
                short: 'a', long: 'all',
                description: 'Print all matching executables in PATH, not just the first'
        }
]

export const isWindows = process.platform === 'win32' 
        || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';


export const which: defined.sh<string> = (main, ...args) => {
        const { options, stdin } = interpret(which_options, main, args);
        const seperator = isWindows ? ';' : ':';

        const environments = [ isWindows ? process.cwd() : '', ...process.env.PATH?.split(seperator) || '' ];
        const extensions = (isWindows ? process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD' : '').toLowerCase().split(seperator);

        const res = stdin.map(function processor(input) {
                const matches: Array<string> = [];
                environments.forEach(environment => {
                        if(matches.length > 0 && !options.all) return;
                        const parent = path.join(environment, input);

                        extensions.forEach(extension => {
                                const path = parent + extension;

                                if(stream.existsSync(path) && stream.statSync(path).isFile()) {
                                        matches.push(path);
                                }
                        })
                })
                return matches
        }).flat().join('\n')

        return new UnixExtension(res);
}