"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushd = exports.pushd_options = void 0;
const exception_1 = require("#internal/exception");
const interpreter_1 = require("#internal/interpreter");
const extension_1 = require("#internal/extension");
const dirs_1 = require("#assm/dirs");
const cd_1 = require("#assm/cd");
exports.pushd_options = [
    {
        short: 'n', description: 'Suppresses the normal change of directory when adding\n directories to the stack, so only the stack is manipulated.'
    }
];
const pushd = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.pushd_options, main, args);
    if (stdin.length > 1) {
        throw new exception_1.InternalError('-node: pushd: too many arguments.');
    }
    let stacks = (0, dirs_1.load_stacks)(), input = stdin[0];
    switch (true) {
        case input === '+0':
            return new extension_1.UnixExtension(stacks);
        case !input:
            if (stacks.length <= 1) {
                throw new exception_1.InternalError('-node: pushd: no other directory.');
            }
            stacks = stacks.splice(1, 1).concat(stacks);
            break;
        case (0, dirs_1.is_index)(input):
            try {
                const index = (0, dirs_1.load_index)(input);
                stacks = stacks.splice(index, 1).concat(stacks);
            }
            catch (error) {
                throw new exception_1.InternalError(error.message, undefined, 0, ['-node', 'pushd']);
            }
            break;
        case options.n:
            stacks.splice(1, 0, input);
            break;
        default:
            stacks.unshift(input);
            break;
    }
    if (!options.n) {
        try {
            (0, cd_1.cd) `${stacks.shift()}`;
        }
        catch (error) {
            throw new exception_1.InternalError(error.message, undefined, 0, ['-node', 'pushd']);
        }
    }
    else
        stacks = stacks.slice(1);
    dirs_1.DIRECTORY_STACK.splice(0, dirs_1.DIRECTORY_STACK.length, ...stacks);
    return new extension_1.UnixExtension((0, dirs_1.load_stacks)());
};
exports.pushd = pushd;
