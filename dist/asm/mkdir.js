"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mkdir = exports.mkdir_options = void 0;
const interpreter_1 = require("../internal/interpreter");
const posix_1 = __importDefault(require("path/posix"));
const fs_1 = __importDefault(require("fs"));
const exception_1 = require("../internal/exception");
exports.mkdir_options = [
    {
        short: 'm', long: 'mode', input: 'MODE',
        description: 'set file mode (as in chmod), not a=rwx - umask'
    },
    {
        short: 'p', long: 'parents',
        description: 'no error if existing, make parent directories as needed'
    }
];
const mkdir = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.mkdir_options, main, args);
    stdin.forEach(function processor(input) {
        if (fs_1.default.existsSync(input)) {
            throw new exception_1.InternalError(`mkdir: cannot create directory \`${input}\`: is already exists.`, undefined, 2);
        }
        const parent = posix_1.default.dirname(input);
        if (!fs_1.default.existsSync(parent) && !options.parents) {
            throw new exception_1.InternalError(`mkdir: cannot create directory \`${input}\`: no such file or directory.`, undefined, 2);
        }
        fs_1.default.mkdirSync(input, { recursive: options.parents, mode: options.mode });
    });
};
exports.mkdir = mkdir;
