import * as defined from 'internal/defined'
import { UnixExtension } from 'internal/extension'
import { interpret } from 'internal/interpreter'
import path from 'node:path'
import fs from 'node:fs'

export const which_options: defined.binary_options = [
        {
                short: 'a', long: 'all',
                description: 'Print all matching executables in PATH, not just the first'
        }
]

export const isWindows = process.platform === 'win32' 
        || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';

export const which: defined.asm<string> = (main, ...args) => {
        const { options, stdin } = interpret(which_options, main, args);

        const seperator = isWindows ? ';' : ':';
        const environments = [ isWindows ? process.cwd() : '', ...process.env.PATH?.split(seperator) || '' ];
        const extensions = (isWindows ? process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD' : '').toLowerCase().split(seperator);

        const res = stdin.reduce<string[]>(function processor(output, input) {

                environments.forEach(env => extensions.forEach(extension => {
                        if(output.length > 0 && !options.all) return output;
                        const target = path.join(env, input) + extension;
                        
                        if(fs.existsSync(target) && fs.statSync(target).isFile()) output.push(target);
                }))
                return output;
        }, []).join('\n');

        return new UnixExtension(res);
}