"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.echo = exports.echo_options = void 0;
const extension_1 = require("../internal/extension");
const interpreter_1 = require("../internal/interpreter");
exports.echo_options = [
    {
        short: 'n',
        description: 'do not output the trailing newline'
    },
    {
        short: 'e',
        description: 'enable interpretation of backslash escapes'
    }
];
const echo = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.echo_options, main, args);
    const output = stdin.join(' ') + (options.n ? '' : '\n');
    return new extension_1.UnixExtension(output);
};
exports.echo = echo;
