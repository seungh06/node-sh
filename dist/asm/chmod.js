"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.process_symbol = exports.get_permission = exports.permissions = exports.get_struct = exports.to_int = exports.load_reference = exports.constants = exports.chmod = exports.chmod_options = void 0;
const posix_1 = __importDefault(require("path/posix"));
const fs_1 = __importDefault(require("fs"));
const exception_1 = require("#internal/exception");
const interpreter_1 = require("#internal/interpreter");
exports.chmod_options = [
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
];
const chmod = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.chmod_options, main, args);
    if (!options.reference && stdin.length < 2) {
        throw new exception_1.InternalError(`chmod: missing operand after \`${stdin}\``);
    }
    const mode = options.reference ? load_reference(options.reference) : (0, exports.to_int)(stdin.shift());
    if (options.recursive) {
        const child = stdin.map(main => {
            if (!fs_1.default.existsSync(main)) {
                throw new exception_1.InternalError(`chmod: cannot access \`${main}\`: no such file or directory.`);
            }
            return fs_1.default.statSync(main).isDirectory()
                ? get_struct(main) : [main];
        }).flat();
        stdin.push(...child);
    }
    stdin.forEach(function processor(input) {
        if (!fs_1.default.existsSync(input)) {
            throw new exception_1.InternalError(`chmod: cannot access \`${input}\`: no such file or directory.`, undefined, 2);
        }
        const stats = fs_1.default.statSync(input), is_dirs = stats.isDirectory();
        let permission = stats.mode, type = permission & fs_1.default.constants.S_IFMT;
        let new_permission = permission;
        if (typeof mode !== 'number') {
            for (const symbol of mode.split(',')) {
                const matches = /([ugoa]*)([=+-])([rwxXst]*)/i.exec(symbol);
                if (!matches) {
                    throw new exception_1.InternalError(`chmod: invalid mode: ${symbol}`, undefined, 2);
                }
                const changes = process_symbol(matches);
                if (is_dirs && changes.symbol.exec_dir) {
                    changes.symbol.execute = true;
                }
                let mask = 0;
                if (changes.target.user) {
                    mask
                        |= (changes.symbol.read ? exports.constants.READ << 6 : 0)
                            + (changes.symbol.write ? exports.constants.WRITE << 6 : 0)
                            + (changes.symbol.execute ? exports.constants.EXEC << 6 : 0)
                            + (changes.symbol.setuid ? exports.constants.S_ISUID : 0);
                }
                if (changes.target.group) {
                    mask
                        |= (changes.symbol.read ? exports.constants.READ << 3 : 0)
                            + (changes.symbol.write ? exports.constants.WRITE << 3 : 0)
                            + (changes.symbol.execute ? exports.constants.EXEC << 3 : 0)
                            + (changes.symbol.setuid ? exports.constants.S_ISGID : 0);
                }
                if (changes.target.other) {
                    mask
                        |= (changes.symbol.read ? exports.constants.READ : 0)
                            + (changes.symbol.write ? exports.constants.WRITE : 0)
                            + (changes.symbol.execute ? exports.constants.EXEC : 0);
                }
                if (changes.symbol.sticky) {
                    mask |= exports.constants.S_ISVTX; // STICKY BIT
                }
                switch (changes.operator) {
                    case '+':
                        new_permission |= mask;
                        break;
                    case '-':
                        new_permission &= ~mask;
                        break;
                    case '=':
                        new_permission = type + mask;
                        if (is_dirs)
                            new_permission |= (exports.constants.S_ISUID + exports.constants.S_ISGID) & permission;
                        break;
                    default:
                        throw new exception_1.InternalError(`chmod: cannot recognize operator \`${changes.operator}\`.`, undefined, 2);
                }
                if (permission !== new_permission) {
                    if (options.changes) {
                        const from = get_permission(permission), changed = get_permission(new_permission);
                        console.log(`mode of \`${input}\` changed from ${from} to ${changed}`);
                    }
                    fs_1.default.chmodSync(input, new_permission);
                    permission = new_permission;
                }
            }
        }
        else {
            new_permission = type + parseInt(mode.toString(), 8);
            if (options.changes) {
                const from = get_permission(permission), changed = get_permission(new_permission);
                console.log(`mode of \`${input}\` changed from ${from} to ${changed}`);
            }
            fs_1.default.chmodSync(input, new_permission);
        }
    });
};
exports.chmod = chmod;
exports.constants = {
    EXEC: 1, WRITE: 2, READ: 4,
    S_ISUID: 2048, S_ISGID: 1024, S_ISVTX: 512
};
function load_reference(target) {
    try {
        return fs_1.default.statSync(target).mode;
    }
    catch {
        throw new exception_1.InternalError(`chmod: failed to get attributes of \`${target}\`: no such file or directory.`, undefined, 1);
    }
}
exports.load_reference = load_reference;
const to_int = (input) => {
    return parseInt(input) || input;
};
exports.to_int = to_int;
function get_struct(main) {
    const res = [];
    fs_1.default.readdirSync(main, { withFileTypes: true }).forEach(dirent => {
        const basename = posix_1.default.join(main, dirent.name);
        if (dirent.isDirectory())
            res.push(basename, ...get_struct(basename));
        else
            res.push(basename);
    });
    return res;
}
exports.get_struct = get_struct;
exports.permissions = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
function get_permission(mode) {
    const octal = (mode & parseInt('0777', 8)).toString(8);
    const string = octal.split('').map(int => exports.permissions[parseInt(int)]).join('');
    return `0${octal} (${string})`;
}
exports.get_permission = get_permission;
function process_symbol(symbol) {
    const [, target, operator, changes] = symbol;
    const change_all = target === 'a' || target === '';
    return {
        target: {
            user: target.includes('u') || change_all,
            group: target.includes('g') || change_all,
            other: target.includes('o') || change_all
        },
        operator,
        symbol: {
            read: changes.includes('r'),
            write: changes.includes('w'),
            execute: changes.includes('x'),
            exec_dir: changes.includes('X'),
            sticky: changes.includes('t'),
            setuid: changes.includes('s')
        }
    };
}
exports.process_symbol = process_symbol;
