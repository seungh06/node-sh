"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.popd = exports.popd_options = void 0;
const exception_1 = require("../internal/exception");
const interpreter_1 = require("../internal/interpreter");
const extension_1 = require("../internal/extension");
const dirs_1 = require("../asm/dirs");
const cd_1 = require("../asm/cd");
exports.popd_options = [
    {
        short: 'n', description: 'Suppresses the normal change of directory when removing\n directories from the stack, so only the stack is manipulated.'
    }
];
const popd = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.popd_options, main, args);
    if (stdin.length > 1) {
        throw new exception_1.InternalError(`-node: popd: too many arguments.`);
    }
    if (dirs_1.DIRECTORY_STACK.length <= 0) {
        throw new exception_1.InternalError(`-node: popd: directory stack empty.`);
    }
    try {
        let index = (0, dirs_1.load_index)(stdin[0] || '+0');
        if (options.n || index > 0 || dirs_1.DIRECTORY_STACK.length + index === 0) {
            index = index > 0 ? index - 1 : index;
            dirs_1.DIRECTORY_STACK.splice(index, 1);
        }
        else
            (0, cd_1.cd) `${dirs_1.DIRECTORY_STACK.shift()}`;
    }
    catch (error) {
        throw new exception_1.InternalError(error.message, undefined, 0, ['-node', 'popd']);
    }
    return new extension_1.UnixExtension((0, dirs_1.load_stacks)());
};
exports.popd = popd;
