import * as defined from 'internal/defined'
import { InternalError } from 'internal/exception'
import { UnixExtension } from 'internal/extension'
import { interpret } from 'internal/interpreter'
import path from 'node:path/posix'
import fs from 'node:fs'

export const ls_options: defined.binary_options = [
        {
                short: 'a', long: 'all',
                description: 'do not ignore entries starting with .'
        },

        {
                short: 'A', long: 'almost-all',
                description: 'do not list implied . and ..'
        },

        {
                short: 'd', long: 'directory',
                description: 'list directories themselves, not their contents'
        },

        {
                short: 'l', description: 'use a long listing format'
        },

        {
                short: 'L', long: 'dereference',
                description: 'when showing file information for a symbolic\n link, show information for the file the link\n references rather than for the link itself'
        },

        {
                short: 'r', long: 'reverse',
                description: 'reverse order while sorting'
        },

        {
                short: 'R', long: 'recursive',
                description: 'list subdirectories recursively'
        }
]

export const ls: defined.asm<string[]> = (main, ...args) => {
        const { options, stdin } = interpret(ls_options, main, args);

        if(stdin.length < 1) {
                stdin.unshift('.');
        }

        const register = (input: string) => {
                const normal = path.normalize(input);
                const basename = options.recursive || stdin.length > 1 ? normal : path.basename(normal);

                if(options.l) {
                        const stat = fs[ options.dereference ? 'statSync' : 'lstatSync' ](normal);
                        return [ get_permission(stat.mode), stat.nlink, stat.uid, stat.gid, stat.size, format_date(stat.mtime), basename ].join(' ')
                } else return basename;
        }

        const res = stdin.map(function processor(input) {
                if(!fs.existsSync(input)) {
                        throw new InternalError(`ls: cannot access: \`${input}\`: no such file or directory.`, undefined, 2);
                }

                const stat = fs[ options.dereference ? 'statSync' : 'lstatSync' ](input);
                if(stat.isDirectory() && !options.directory) {
                        return get_struct(input, options.all || options.almost_all, options.recursive).map(value => register(value));
                } else return register(input);
        }).flat()

        return new UnixExtension(res);
}
export const permissions = [ '---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];

export function get_permission(mode: number) {
        const permission = (mode & parseInt('0777', 8)).toString(8)
                .split('').map(int => permissions[parseInt(int)]).join('');

        const type = {
                [ fs.constants.S_IFDIR ]: 'd',
                [ fs.constants.S_IFBLK ]: 'b',
                [ fs.constants.S_IFCHR ]: 'c', 
                [ fs.constants.S_IFLNK ]: 'l', 
                [ fs.constants.S_IFSOCK ]: 's',
                [ fs.constants.S_IFREG ]: '-'
        }[ mode & fs.constants.S_IFMT ]

        return type + permission;
}

export function format_date(date: Date) {
        return `${ get_month(date.getMonth()) } ${ date.getDate() } ` + [
                pad_digits(date.getHours()), pad_digits(date.getMinutes())
        ].join(':');
}

export const pad_digits = (num: number) => {
        return num.toString().padStart(2, '0');
}

export const get_month = (month: number) => {
        return [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ][month];
}

export function get_struct(main: string, all: boolean, recursive: boolean) {
        const res: Array<string> = [];
        const dirents = fs.readdirSync(main, { withFileTypes: true });

        for(const dirent of dirents) {
                if(dirent.name.startsWith('.') && !all) continue;

                const basename = path.join(main, dirent.name);
                if(dirent.isDirectory() && recursive) res.push(basename, ...get_struct(basename, all, true))
                else res.push(basename);
        }

        return res;
}