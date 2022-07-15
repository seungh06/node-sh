import * as defined from '../internal/defined'
import { InternalError } from '../internal/exception'
import { interpret } from '../internal/interpreter'
import stream from 'node:fs'
import path from 'node:path'

export const cp_options: defined.sh_options = [
        {
                short: 'b', long: 'backup',
                description: 'make a backup of each existing destination file'
        },

        {
                short: 'S', long: 'suffix', input: 'SUFFIX',
                description: 'override the usual backup suffix'
        },

        {
                short: 'l', long: 'dereference',
                description: 'always follow symbolic links in SOURCE'
        },

        {
                short: 'P', long: 'no-dereference',
                description: 'never follow symbolic links in SOURCE'
        },

        {
                short: [ 'r', 'R' ], long: 'recursive',
                description: 'copy directories recursively'
        },

        {
                short: 'u', long: 'update',
                description: 'copy only when the SOURCE file is newer\nthan the destination file or when the\ndestination file is missing'
        }
]

export const isWindows = process.platform === 'win32' 
        || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';

export const cp: defined.sh<void> = (main, ...args) => {
        const { options, stdin } = interpret(cp_options, main, args);

        if(stdin.length < 2) {
                throw new InternalError(`cp: missing source and/or destination file.`);
        }
        
        if(options.dereference) {
                options.no_dereference = false; 
        }

        if(!options.recursive && !options.no_dereference) {
                options.dereference = true;
        }

        const sources = stdin.slice(0, stdin.length - 1), dest = stdin[stdin.length - 1];
        const exists = stream.existsSync(dest), is_dirs = is_dir(dest);

        if((!exists || !is_dirs) && sources.length > 1) {
                throw new InternalError(`cp: target \`${dest}\` is not a directory`);
        }

        sources.forEach(function processor(input) {
                if(!stream.existsSync(input)) {
                        throw new InternalError(`cp: cannot stat \`${input}\`: No such file or directory`, undefined, 2);
                }

                const src = stream.statSync(input);
                if(!options.no_dereference && src.isDirectory()) {
                        if(!options.recursive) throw new InternalError(`cp: -r not specified; omitting directory \`${input}\``, undefined, 2);

                        const destination = exists && is_dirs 
                                ? path.join(dest, path.basename(input))
                                : dest

                        if(!stream.existsSync(path.dirname(destination))) {
                                throw new InternalError(`cp: cannot create directory \`${destination}\`: No such file or directory`, undefined, 2);
                        }

                        if(path.resolve(input) === path.dirname(path.resolve(destination))) {
                                throw new InternalError(`cp: cannot copy a directory, \`${input}\`, into itself, \`${destination}\``, undefined, 2);
                        }
                        
                        copy_struct(input, destination);
                } else {
                        let destination = exists && is_dirs 
                                ? path.normalize(`${dest}/${path.basename(input)}`)
                                : dest

                        if(stream.existsSync(destination) && options.backup) {
                                const roots = destination.split('/');
                                const basename = (options.suffix || '~') + roots.pop();

                                stream.renameSync(destination, roots.concat(basename).join('/'));
                        }

                        if(path.relative(input, destination) === '') {
                                throw new InternalError(`cp: \`${input}\` and \`${destination}\` are the same file`, undefined, 2);
                        }

                        try {
                                if(options.update && stream.statSync(input).mtime < stream.statSync(destination).mtime) {
                                        return;
                                }
                        } catch { /* IGNORE */ }

                        if(stream.statSync(input).isSymbolicLink() && !options.dereference) {
                                try {
                                        stream.lstatSync(destination);
                                        stream.unlinkSync(destination);
                                } catch { /* IGNORE */ }

                                const link = stream.readlinkSync(input);
                                stream.symlinkSync(link, destination, isWindows ? 'junction' : null); 
                        } else {
                                stream.copyFileSync(input, destination);
                        }
                }

        })
}

export const is_dir = (main: string) => {
        try {
                return stream.statSync(main).isDirectory();
        } catch { return false }
}

export const copy_struct = (source: string, dest: string) => {
        const dirents = stream.readdirSync(source, { withFileTypes: true });
        if(!stream.existsSync(dest)) stream.mkdirSync(dest);

        for(const dirent of dirents) {
                const origin = path.join(source, dirent.name);
                const head = path.join(dest, dirent.name);

                if(dirent.isDirectory()) {
                        copy_struct(origin, head);
                } else stream.copyFileSync(origin, head)
        }
}