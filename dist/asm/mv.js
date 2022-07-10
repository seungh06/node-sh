"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.is_dir = exports.mv = exports.mv_options = void 0;
const exception_1 = require("internal/exception");
const interpreter_1 = require("internal/interpreter");
const posix_1 = __importDefault(require("path/posix"));
const fs_1 = __importDefault(require("fs"));
exports.mv_options = [
    {
        short: 'b', long: 'backup',
        description: 'make a backup of each existing destination file'
    },
    {
        short: 'S', long: 'suffix', input: 'SUFFIX',
        description: 'override the usual backup suffix'
    }
];
const mv = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.mv_options, main, args);
    if (stdin.length < 2) {
        throw new exception_1.InternalError(`mv: mv: missing source and/or destination file.`);
    }
    const sources = stdin.slice(0, stdin.length - 1), dest = stdin[stdin.length - 1];
    const exists = fs_1.default.existsSync(dest), is_dirs = (0, exports.is_dir)(dest);
    if ((!exists || !is_dirs) && sources.length > 1) {
        throw new exception_1.InternalError(`mv: target \`${dest}\` is not a directory`);
    }
    sources.forEach(function processor(input) {
        if (!fs_1.default.existsSync(input)) {
            throw new exception_1.InternalError(`mv: cannot stat \`${input}\`: No such file or directory`, undefined, 2);
        }
        let destination = exists && is_dirs ? posix_1.default.join(dest, input) : dest;
        if (input === destination) {
            throw new exception_1.InternalError(`mv: \`${input}\` and \`${destination}\` are the same file`, undefined, 2);
        }
        if (posix_1.default.resolve(input) === posix_1.default.dirname(posix_1.default.resolve(destination))) {
            throw new exception_1.InternalError(`mv: cannot move \`${input}\` to a subdirectory of itself, \`${destination}\``, undefined, 2);
        }
        if (fs_1.default.existsSync(destination) && options.backup) {
            const roots = destination.split('/');
            const basename = (options.suffix || '~') + roots.pop();
            fs_1.default.renameSync(destination, roots.concat(basename).join('/'));
        }
        fs_1.default.renameSync(input, destination);
    });
};
exports.mv = mv;
const is_dir = (main) => {
    try {
        return fs_1.default.statSync(main).isDirectory();
    }
    catch {
        return false;
    }
};
exports.is_dir = is_dir;
