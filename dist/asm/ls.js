"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_struct = exports.get_month = exports.pad_digits = exports.format_date = exports.get_permission = exports.permissions = exports.ls = exports.ls_options = void 0;
const extension_1 = require("internal/extension");
const interpreter_1 = require("internal/interpreter");
const exception_1 = require("internal/exception");
const posix_1 = __importDefault(require("path/posix"));
const fs_1 = __importDefault(require("fs"));
exports.ls_options = [
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
];
const ls = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.ls_options, main, args);
    if (stdin.length < 1) {
        stdin.unshift('.');
    }
    const register = (input) => {
        const normal = posix_1.default.normalize(input);
        const basename = options.recursive || stdin.length > 1 ? normal : posix_1.default.basename(normal);
        if (options.l) {
            const stat = fs_1.default[options.dereference ? 'statSync' : 'lstatSync'](normal);
            return [get_permission(stat.mode), stat.nlink, stat.uid, stat.gid, stat.size, format_date(stat.mtime), basename].join(' ');
        }
        else
            return basename;
    };
    const res = stdin.map(function processor(input) {
        if (!fs_1.default.existsSync(input)) {
            throw new exception_1.InternalError(`ls: cannot access: \`${input}\`: no such file or directory.`, undefined, 2);
        }
        const stat = fs_1.default[options.dereference ? 'statSync' : 'lstatSync'](input);
        if (stat.isDirectory() && !options.directory) {
            return get_struct(input, options.all || options.almost_all, options.recursive).map(value => register(value));
        }
        else
            return register(input);
    }).flat();
    return new extension_1.UnixExtension(res);
};
exports.ls = ls;
exports.permissions = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
function get_permission(mode) {
    const permission = (mode & parseInt('0777', 8)).toString(8)
        .split('').map(int => exports.permissions[parseInt(int)]).join('');
    const type = {
        [fs_1.default.constants.S_IFDIR]: 'd',
        [fs_1.default.constants.S_IFBLK]: 'b',
        [fs_1.default.constants.S_IFCHR]: 'c',
        [fs_1.default.constants.S_IFLNK]: 'l',
        [fs_1.default.constants.S_IFSOCK]: 's',
        [fs_1.default.constants.S_IFREG]: '-'
    }[mode & fs_1.default.constants.S_IFMT];
    return type + permission;
}
exports.get_permission = get_permission;
function format_date(date) {
    return `${(0, exports.get_month)(date.getMonth())} ${date.getDate()} ` + [
        (0, exports.pad_digits)(date.getHours()), (0, exports.pad_digits)(date.getMinutes())
    ].join(':');
}
exports.format_date = format_date;
const pad_digits = (num) => {
    return num.toString().padStart(2, '0');
};
exports.pad_digits = pad_digits;
const get_month = (month) => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month];
};
exports.get_month = get_month;
function get_struct(main, all, recursive) {
    const res = [];
    fs_1.default.readdirSync(main, { withFileTypes: true }).forEach(dirent => {
        if (dirent.name.startsWith('.') && !all) {
            return;
        }
        const basename = posix_1.default.join(main, dirent.name);
        if (dirent.isDirectory() && recursive)
            res.push(basename, ...get_struct(main, all, true));
        else
            res.push(basename);
    });
    return res;
}
exports.get_struct = get_struct;
