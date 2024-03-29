import * as defined from 'internal/defined'
import { InternalError } from 'internal/exception'
import { interpret } from 'internal/interpreter'
import path from 'node:path/posix'
import fs from 'node:fs'

export const mv_options: defined.binary_options = [
        {
                short: 'b', long: 'backup',
                description: 'make a backup of each existing destination file'
        },

        {
                short: 'S', long: 'suffix', input: 'SUFFIX',
                description: 'override the usual backup suffix'
        }
]

export const mv: defined.asm<void> = (main, ...args) => {
        const { options, stdin } = interpret(mv_options, main, args);

        if(stdin.length < 2) {
                throw new InternalError(`mv: missing source and/or destination file.`);
        }

        const sources = stdin.slice(0, stdin.length - 1), dest = stdin[stdin.length - 1];
        const exists = fs.existsSync(dest), is_dirs = is_dir(dest);

        if((!exists || !is_dirs) && sources.length > 1) {
                throw new InternalError(`mv: target \`${dest}\` is not a directory`);
        }

        sources.forEach(function processor(input) {
                if(!fs.existsSync(input)) {
                        throw new InternalError(`mv: cannot stat \`${input}\`: No such file or directory`, undefined, 2);
                }

                let destination = exists && is_dirs ? path.join(dest, input) : dest;
                if(input === destination) {
                        throw new InternalError(`mv: \`${input}\` and \`${destination}\` are the same file`, undefined, 2);
                }

                if(path.resolve(input) === path.dirname(path.resolve(destination))) {
                        throw new InternalError(`mv: cannot move \`${input}\` to a subdirectory of itself, \`${ destination }\``, undefined, 2);
                }

                if(fs.existsSync(destination) && options.backup) {
                        const root = destination.split('/');
                        const basename = (options.suffix || '~') + root.pop();

                        fs.renameSync(destination, root.concat(basename).join('/'));
                }

                fs.renameSync(input, destination);
        })
}

export const is_dir = (main: string) => {
        try {
                return fs.statSync(main).isDirectory();
        } catch { return false }
}