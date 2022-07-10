"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rm = exports.rm_options = void 0;
const interpreter_1 = require("#internal/interpreter");
const fs_1 = __importDefault(require("fs"));
const exception_1 = require("#internal/exception");
exports.rm_options = [
    {
        short: 'f', long: 'force',
        description: 'ignore nonexistent files and arguments, never prompt'
    },
    {
        short: 'r', long: 'recursive',
        description: 'remove directories and their contents recursively'
    }
];
const rm = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.rm_options, main, args);
    stdin.forEach(function processor(input) {
        if (!fs_1.default.existsSync(input)) {
            throw new exception_1.InternalError(`rm: cannot remove \`${input}\`: no such file or directory.`, undefined, 2);
        }
        const stat = fs_1.default.lstatSync(input.endsWith('/') ? input.slice(0, -1) : input);
        const type = stat.isFile() ? 'FILE' : stat.isDirectory() ? 'DIRECTORY'
            : stat.isSymbolicLink() ? 'SYMINK' : stat.isFIFO() ? 'FIFO' : 'UNKNOWN';
        switch (type) {
            case 'FILE':
                fs_1.default.access(input, fs_1.default.constants.W_OK, exception => {
                    if (exception && !options.force) {
                        throw new exception_1.InternalError(`rm: failed to remove \`${input}\`: permission denied.`, undefined, 2);
                    }
                    fs_1.default.unlinkSync(input);
                });
                break;
            case 'DIRECTORY':
                if (!options.recursive) {
                    throw new exception_1.InternalError(`rm: cannot remove directory \`${input}\`: directory not empty.`, 'if you want to remove recursivly, please use -r or --recursive options.', 2);
                }
                fs_1.default.rmSync(input, {
                    recursive: true, force: options.force || false
                });
                break;
            case 'FIFO':
                fs_1.default.unlinkSync(input);
                break;
            case 'SYMINK':
                const stat = fs_1.default.statSync(input);
                if (stat.isDirectory() && input.endsWith('/')) {
                    if (!options.recursive) {
                        throw new exception_1.InternalError(`rm: cannot remove directory \`${input}\`: directory not empty.`, 'if you want to remove recursivly, please use -r or --recursive options.', 2);
                    }
                    fs_1.default.rmSync(input, {
                        recursive: true, force: options.force || false
                    });
                }
                else
                    fs_1.default.unlinkSync(input);
                break;
        }
    });
};
exports.rm = rm;
