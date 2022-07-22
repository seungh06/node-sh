import * as defined from 'internal/defined'
import { InternalError } from 'internal/exception'
import { interpret } from 'internal/interpreter'
import path from 'node:path'
import fs from 'node:fs'

export const ln_options: defined.binary_options = [
        {
                short: 'b', long: 'backup',
                description: 'make a backup of each existing destination file'
        },

        {
                short: 'f', long: 'force',
                description: 'remove existing destination files'
        },

        {
                short: 's', long: 'symbolic',
                description: 'make symbolic links instead of hard links'
        },

        {
                short: 'S', long: 'suffix', input: 'SUFFIX',
                description: 'override the usual backup suffix'
        }
]

export const isWindows = process.platform === 'win32' 
        || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';

export const ln: defined.asm<void> = (main, ...args) => {
        const { options, stdin } = interpret(ln_options, main, args);

        if(stdin.length < 2) {
                throw new InternalError(`ln: missing source and/or destination file.`);
        }

        const source = path.resolve(process.cwd(), stdin[0]);
        const is_absolute = path.resolve(source) === source; 
        if(!fs.existsSync(source)) {
                throw new InternalError(`ln: failed to access \`${stdin[0]}\`: No such file or directory`);
        }

        const destination = path.resolve(process.cwd(), stdin[1]);
        if(fs.existsSync(destination)) {
                if(!options.force && !options.backup) {
                        throw new InternalError(`ln: failed to create ${ options.symbolic ? 'symbolic' : 'hard' } link \`${stdin[1]}\`: File exists`);
                }

                if(options.backup) {
                        const root = destination.split('/');
                        const basename = root.pop() + (options.suffix || '~');
                        fs.renameSync(destination, root.concat(basename).join('/'));
                } else fs.unlinkSync(destination);
        }

        try {
                if(options.symbolic) {
                        const resolved = is_absolute ? source : path.resolve(process.cwd(), path.dirname(destination), source);
                        const type = isWindows ? fs.statSync(resolved).isDirectory() ? 'junction' : 'file' : null;
        
                        fs.symlinkSync(type === 'junction' ? resolved : source, destination, type);
                } else fs.linkSync(source, destination);
        } catch(exception: any) {
                throw new InternalError(exception.message);
        }
}