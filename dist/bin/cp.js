"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copy_struct = exports.is_dir = exports.cp = exports.isWindows = exports.cp_options = void 0;
const exception_1 = require("internal/exception");
const interpreter_1 = require("internal/interpreter");
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
exports.cp_options = [
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
        short: ['r', 'R'], long: 'recursive',
        description: 'copy directories recursively'
    },
    {
        short: 'u', long: 'update',
        description: 'copy only when the SOURCE file is newer\nthan the destination file or when the\ndestination file is missing'
    }
];
exports.isWindows = process.platform === 'win32'
    || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';
const cp = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.cp_options, main, args);
    if (stdin.length < 2) {
        throw new exception_1.InternalError(`cp: missing source and/or destination file.`);
    }
    if (options.dereference) {
        options.no_dereference = false;
    }
    if (!options.recursive && !options.no_dereference) {
        options.dereference = true;
    }
    const sources = stdin.slice(0, stdin.length - 1), dest = stdin[stdin.length - 1];
    const exists = node_fs_1.default.existsSync(dest), is_dirs = (0, exports.is_dir)(dest);
    if ((!exists || !is_dirs) && sources.length > 1) {
        throw new exception_1.InternalError(`cp: target \`${dest}\` is not a directory`);
    }
    sources.forEach(function processor(input) {
        if (!node_fs_1.default.existsSync(input)) {
            throw new exception_1.InternalError(`cp: cannot stat \`${input}\`: No such file or directory`, undefined, 2);
        }
        const src = node_fs_1.default.statSync(input);
        if (!options.no_dereference && src.isDirectory()) {
            if (!options.recursive)
                throw new exception_1.InternalError(`cp: -r not specified; omitting directory \`${input}\``, undefined, 2);
            const destination = exists && is_dirs
                ? node_path_1.default.join(dest, node_path_1.default.basename(input))
                : dest;
            if (!node_fs_1.default.existsSync(node_path_1.default.dirname(destination))) {
                throw new exception_1.InternalError(`cp: cannot create directory \`${destination}\`: No such file or directory`, undefined, 2);
            }
            if (node_path_1.default.resolve(input) === node_path_1.default.dirname(node_path_1.default.resolve(destination))) {
                throw new exception_1.InternalError(`cp: cannot copy a directory, \`${input}\`, into itself, \`${destination}\``, undefined, 2);
            }
            (0, exports.copy_struct)(input, destination);
        }
        else {
            let destination = exists && is_dirs
                ? node_path_1.default.normalize(`${dest}/${node_path_1.default.basename(input)}`)
                : dest;
            if (node_fs_1.default.existsSync(destination) && options.backup) {
                const roots = destination.split('/');
                const basename = (options.suffix || '~') + roots.pop();
                node_fs_1.default.renameSync(destination, roots.concat(basename).join('/'));
            }
            if (node_path_1.default.relative(input, destination) === '') {
                throw new exception_1.InternalError(`cp: \`${input}\` and \`${destination}\` are the same file`, undefined, 2);
            }
            try {
                if (options.update && node_fs_1.default.statSync(input).mtime < node_fs_1.default.statSync(destination).mtime) {
                    return;
                }
            }
            catch { /* IGNORE */ }
            if (node_fs_1.default.statSync(input).isSymbolicLink() && !options.dereference) {
                try {
                    node_fs_1.default.lstatSync(destination);
                    node_fs_1.default.unlinkSync(destination);
                }
                catch { /* IGNORE */ }
                const link = node_fs_1.default.readlinkSync(input);
                node_fs_1.default.symlinkSync(link, destination, exports.isWindows ? 'junction' : null);
            }
            else {
                node_fs_1.default.copyFileSync(input, destination);
            }
        }
    });
};
exports.cp = cp;
const is_dir = (main) => {
    try {
        return node_fs_1.default.statSync(main).isDirectory();
    }
    catch {
        return false;
    }
};
exports.is_dir = is_dir;
const copy_struct = (source, dest) => {
    const dirents = node_fs_1.default.readdirSync(source, { withFileTypes: true });
    if (!node_fs_1.default.existsSync(dest))
        node_fs_1.default.mkdirSync(dest);
    for (const dirent of dirents) {
        const origin = node_path_1.default.join(source, dirent.name);
        const head = node_path_1.default.join(dest, dirent.name);
        dirent.isDirectory() ? (0, exports.copy_struct)(origin, head) : node_fs_1.default.copyFileSync(origin, head);
    }
};
exports.copy_struct = copy_struct;
