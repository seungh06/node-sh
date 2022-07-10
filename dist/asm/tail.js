"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tail = exports.tail_options = void 0;
const exception_1 = require("core/exception");
const interpreter_1 = require("core/interpreter");
const fs_1 = __importDefault(require("fs"));
const extension_1 = require("core/extension");
exports.tail_options = [
    {
        short: 'c', long: 'bytes', input: '[+]NUM',
        description: 'output the last NUM bytes; or use -c +NUM to\n output starting with byte NUM of each file'
    },
    {
        short: 'n', long: 'lines', input: '[+]NUM',
        description: 'output the last NUM lines, instead of the last 10;\n or use -n +NUM to output starting with line NUM'
    },
    {
        short: 'q', long: ['quiet', 'silent'],
        description: 'never output headers giving file names'
    }
];
const tail = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.tail_options, main, args);
    const num = parseInt(options.lines || options.bytes) || 10;
    const sep = options.bytes ? '' : '\n';
    const pnv = (options.lines || options.bytes)?.[0] === '+';
    const res = stdin.map(function processor(input) {
        if (!fs_1.default.existsSync(input)) {
            throw new exception_1.InternalError(`tail: cannot open \`${input}\` for reading: no such file or directory.`, undefined, 2);
        }
        if (fs_1.default.statSync(input).isDirectory()) {
            throw new exception_1.InternalError(`tail: error reading \`${input}\`: is a directory.`, undefined, 2);
        }
        const content = fs_1.default.readFileSync(input, 'utf-8').split(sep);
        const value = pnv ? num - 1 : -1 * Math.abs(num);
        const head = options.q || stdin.length <= 1 ? '' : `==> ${input} <==\n`;
        return head + content.slice(value).join(sep);
    }).join(options.q ? '' : '\n\n');
    return new extension_1.UnixExtension(res);
};
exports.tail = tail;
