"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cat = exports.cat_options = void 0;
const exception_1 = require("internal/exception");
const extension_1 = require("internal/extension");
const interpreter_1 = require("internal/interpreter");
const node_fs_1 = __importDefault(require("node:fs"));
exports.cat_options = [
    {
        short: 'n', long: 'number',
        description: 'number all output lines'
    },
    {
        short: 'E', long: 'show-ends',
        description: 'display $ at end of each line'
    },
    {
        short: 'T', long: 'show-tabs',
        description: 'display TAB characters as ^I'
    }
];
const cat = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.cat_options, main, args);
    const res = stdin.reduce(function processor(output, input) {
        if (!node_fs_1.default.existsSync(input)) {
            throw new exception_1.InternalError(`cat: \`${input}\`: no such file or directory.`, undefined, 2);
        }
        if (node_fs_1.default.statSync(input).isDirectory()) {
            throw new exception_1.InternalError(`cat: \`${input}\`: is a directory.`, undefined, 2);
        }
        const raw = node_fs_1.default.readFileSync(input, 'utf-8').replaceAll('\r', '');
        return output + (options.show_tabs ? raw.replace(/\t/g, ' ^I') : raw);
    }, '');
    if (!options.number && !options.show_ends)
        return new extension_1.UnixExtension(res);
    const display = res.split('\n').map(function mapper(value, index) {
        const number = options.number ? `${index + 1}`.padStart(6) + '\t' : '';
        const ends = options.show_ends ? '$' : '';
        return number + value + ends;
    }).join('\n');
    return new extension_1.UnixExtension(display);
};
exports.cat = cat;
