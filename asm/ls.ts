import * as defined from 'core/defined'
import { UnixExtension } from 'core/extension'
import { interpret } from 'core/interpreter'
import { InternalError } from 'core/exception'
import path from 'path/posix'
import stream from 'fs'

export const ls_options: defined.sh_options = [
        {
                short: 'a', long: 'all',
                description: 'do not ignore entries starting with .'
        },

        {
                short: 'A', long: 'almost-all',
                description: 'do not list implied . and ..'
        },

        {
                short: 'd', long: 'directroy',
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

export const ls: defined.sh<string[]> = (main, ...args) => {
        const { options, stdin } = interpret(ls_options, main, args);

        if(stdin.length < 1) {
                stdin.unshift('.');
        }

        const register = (input: string) => {
                const normal = path.normalize(input);
                const basename = options.recursive || stdin.length > 1 ? normal : path.basename(normal);

                if(options.l) {
                        const stat = stream[ options.dereference ? 'statSync' : 'lstatSync' ](normal);
                        return [ get_permission(stat.mode), stat.nlink, stat.uid, stat.gid, stat.size, format_date(stat.mtime), basename ].join(' ')
                } else return basename;
        }

        const res = stdin.map(function processor(input) {
                if(!stream.existsSync(input)) {
                        throw new InternalError(`ls: cannot access: \`${input}\`: no such file or directory.`, undefined, 2);
                }

                const stat = stream[ options.dereference ? 'statSync' : 'lstatSync' ](input);
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
                [ stream.constants.S_IFDIR ]: 'd',
                [ stream.constants.S_IFBLK ]: 'b',
                [ stream.constants.S_IFCHR ]: 'c', 
                [ stream.constants.S_IFLNK ]: 'l', 
                [ stream.constants.S_IFSOCK ]: 's',
                [ stream.constants.S_IFREG ]: '-'
        }[ mode & stream.constants.S_IFMT ]

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

        stream.readdirSync(main, { withFileTypes: true }).forEach(dirent => {
                if(dirent.name.startsWith('.') && !all) {
                        return;
                }

                const basename = path.join(main, dirent.name);
                if(dirent.isDirectory() && recursive) res.push(basename, ...get_struct(main, all, true))
                else res.push(basename);
        })

        return res;
}