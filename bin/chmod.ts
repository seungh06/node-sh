import * as defined from 'internal/defined'
import { InternalError } from 'internal/exception'
import { interpret } from 'internal/interpreter'
import path from 'node:path/posix'
import fs from 'node:fs'

export const chmod_options: defined.binary_options = [
        {
                short: 'c', long: 'changes',
                description: 'like verbose but report only when a change is made'
        },

        {
                long: 'reference', input: 'RFILE',
                description: 'use RFILE\'s mode instead of MODE values'
        },

        {
                short: 'R', long: 'recursive',
                description: 'change files and directories recursively'
        }
]

export const chmod: defined.asm<void> = (main, ...args) => {
        const { options, stdin } = interpret(chmod_options, main, args);

        if(!options.reference && stdin.length < 2) {
                throw new InternalError(`chmod: missing operand after \`${stdin}\``);
        }

        const mode = options.reference ? load_reference(options.reference) : to_int(stdin.shift()!!);

        if(options.recursive) {
                const child = stdin.map(main => {
                        if(!fs.existsSync(main)) {
                                throw new InternalError(`chmod: cannot access \`${main}\`: no such file or directory.`);
                        }

                        return fs.statSync(main).isDirectory() ? get_struct(main) : [ main ]
                }).flat();

                stdin.push(...child);
        }

        stdin.forEach(function processor(input) {
                if(!fs.existsSync(input)) {
                        throw new InternalError(`chmod: cannot access \`${input}\`: no such file or directory.`, undefined, 2);
                }

                const stats = fs.statSync(input), is_dirs = stats.isDirectory();
                let permission = stats.mode, type = permission & fs.constants.S_IFMT;

                let new_permission = permission;
                if(typeof mode !== 'number') {
                        for(const symbol of mode.split(',')) {
                                const matches = /([ugoa]*)([=+-])([rwxXst]*)/i.exec(symbol);

                                if(!matches) {
                                        throw new InternalError(`chmod: invalid mode: ${symbol}`, undefined, 2);
                                }

                                const changes = process_symbol(matches);

                                if(is_dirs && changes.symbol.exec_dir) {
                                        changes.symbol.execute = true;
                                }

                                let mask = 0;
                                
                                if(changes.target.user) {
                                        mask 
                                                |= (changes.symbol.read    ? constants.READ  << 6 : 0) 
                                                +  (changes.symbol.write   ? constants.WRITE << 6 : 0) 
                                                +  (changes.symbol.execute ? constants.EXEC  << 6 : 0)
                                                +  (changes.symbol.setuid  ? constants.S_ISUID    : 0)
                                }

                                if(changes.target.group) {
                                        mask 
                                                |= (changes.symbol.read    ? constants.READ  << 3 : 0) 
                                                +  (changes.symbol.write   ? constants.WRITE << 3 : 0) 
                                                +  (changes.symbol.execute ? constants.EXEC  << 3 : 0)
                                                +  (changes.symbol.setuid  ? constants.S_ISGID    : 0)
                                }

                                if(changes.target.other) {
                                        mask 
                                                |= (changes.symbol.read    ? constants.READ       : 0) 
                                                +  (changes.symbol.write   ? constants.WRITE      : 0) 
                                                +  (changes.symbol.execute ? constants.EXEC       : 0)
                                }

                                if(changes.symbol.sticky) {
                                        mask |= constants.S_ISVTX // STICKY BIT
                                }

                                switch(changes.operator) {
                                        case '+':
                                                new_permission |= mask;
                                                break;
                                        
                                        case '-':
                                                new_permission &= ~mask;
                                                break;

                                        case '=':
                                                new_permission = type + mask;

                                                if(is_dirs) new_permission |= (constants.S_ISUID + constants.S_ISGID) & permission;
                                                break;

                                        default:
                                                throw new InternalError(`chmod: cannot recognize operator \`${changes.operator}\`.`, undefined, 2);
                                }

                                if(permission !== new_permission) {
                                        if(options.changes) {
                                                const from = get_permission(permission), changed = get_permission(new_permission);
                                                console.log(`mode of \`${input}\` changed from ${from} to ${changed}`);
                                        }

                                        fs.chmodSync(input, new_permission);
                                        permission = new_permission;
                                }
                        }
                } else {
                        new_permission = type + parseInt(mode.toString(), 8);

                        if(options.changes) {
                                const from = get_permission(permission), changed = get_permission(new_permission);
                                console.log(`mode of \`${input}\` changed from ${from} to ${changed}`);
                        }

                        fs.chmodSync(input, new_permission);
                }
        })
}

export const constants = {
        EXEC: 1, WRITE: 2, READ: 4,
        S_ISUID: 2048, S_ISGID: 1024, S_ISVTX: 512
}

export function load_reference(target: string) {
        try {
                return fs.statSync(target).mode;
        } catch {
                throw new InternalError(`chmod: failed to get attributes of \`${target}\`: no such file or directory.`, undefined, 1);
        }
}

export const to_int = (input: string) => {
        return parseInt(input) || input;
}

export function get_struct(main: string) {
        const res: Array<string> = [];

        fs.readdirSync(main, { withFileTypes: true }).forEach(dirent => {
                const basename = path.join(main, dirent.name);
                
                if(dirent.isDirectory()) res.push(basename, ...get_struct(basename))
                else res.push(basename);
        })

        return res;
}

export const permissions = [ '---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx' ];
export function get_permission(mode: number) {
        const octal = (mode & parseInt('0777', 8)).toString(8);
        const string = octal.split('').map(int => permissions[ parseInt(int) ]).join('');

        return `0${octal} (${string})`;
}

export function process_symbol(symbol: Array<string>) {
        const [, target, operator, changes ] = symbol;
        const change_all = target === 'a' || target === '';

        return {
                target: {
                        user : target.includes('u') || change_all,
                        group: target.includes('g') || change_all,
                        other: target.includes('o') || change_all
                },
                operator,
                symbol: {
                        read     : changes.includes('r'),
                        write    : changes.includes('w'),
                        execute  : changes.includes('x'),
                        exec_dir : changes.includes('X'),
                        sticky   : changes.includes('t'),
                        setuid   : changes.includes('s')
                }
        }
}