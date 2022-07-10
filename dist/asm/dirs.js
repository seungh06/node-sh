"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.load_index = exports.is_index = exports.load_stacks = exports.DIRECTORY_STACK = exports.dirs = exports.dirs_options = void 0;
const exception_1 = require("internal/exception");
const extension_1 = require("internal/extension");
const interpreter_1 = require("internal/interpreter");
exports.dirs_options = [
    {
        short: 'c', description: 'clear the directory stack by deleting all of the elements'
    }
];
const dirs = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.dirs_options, main, args);
    if (options.c) {
        exports.DIRECTORY_STACK.splice(0, exports.DIRECTORY_STACK.length); // clear stacks
        return new extension_1.UnixExtension(exports.DIRECTORY_STACK);
    }
    const stacks = (0, exports.load_stacks)(), input = stdin[stdin.length - 1];
    if (input) {
        try {
            const index = (0, exports.load_index)(input);
            return new extension_1.UnixExtension([stacks[index < 0
                    ? stacks.length - index
                    : index]]);
        }
        catch (error) {
            throw new exception_1.InternalError(error.message, undefined, 0, ['-node', 'dirs']);
        }
    }
    return new extension_1.UnixExtension(stacks);
};
exports.dirs = dirs;
exports.DIRECTORY_STACK = [];
const load_stacks = () => {
    return [process.cwd()].concat(exports.DIRECTORY_STACK);
};
exports.load_stacks = load_stacks;
const is_index = (input) => {
    return /^[-+]\d+$/.test(input);
};
exports.is_index = is_index;
const load_index = (input) => {
    if (!(0, exports.is_index)(input))
        throw new Error(`${input}: invalid input.`);
    if (Math.abs(parseInt(input)) < exports.DIRECTORY_STACK.length + 1) {
        return /^-/.test(input) ? Number(input) - 1 : Number(input);
    }
    else
        throw new Error(`${input}: directory stack index out of range.`);
};
exports.load_index = load_index;
