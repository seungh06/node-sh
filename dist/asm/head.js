"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.head = exports.head_options = void 0;
const fs_1 = __importDefault(require("fs"));
const interpreter_1 = require("#internal/interpreter");
const exception_1 = require("#internal/exception");
const extension_1 = require("#internal/extension");
exports.head_options = [
    {
        short: 'c', long: 'bytes', input: 'NUM',
        description: 'print the first NUM bytes of each file;'
    },
    {
        short: 'n', long: 'lines', input: 'NUM',
        description: 'print the first NUM lines instead of the first 10;'
    },
    {
        short: 'q', long: ['quiet', 'silent'],
        description: 'never print headers giving file names'
    }
];
const head = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.head_options, main, args);
    const num = parseInt(options.lines || options.bytes) || 10;
    const sep = options.bytes ? '' : '\n';
    const res = stdin.map(function processor(input) {
        if (!fs_1.default.existsSync(input)) {
            throw new exception_1.InternalError(`head: cannot open \`${input}\` for reading: no such file or directory.`, undefined, 2);
        }
        if (fs_1.default.statSync(input).isDirectory()) {
            throw new exception_1.InternalError(`head: error reading \`${input}\`: is a directory.`, undefined, 2);
        }
        const content = fs_1.default.readFileSync(input, 'utf-8').split(sep);
        const head = options.q || stdin.length <= 1 ? '' : `==> ${input} <==\n`;
        return head + content.slice(0, num).join(sep);
    }).join(options.q ? '' : '\n\n');
    return new extension_1.UnixExtension(res);
};
exports.head = head;
