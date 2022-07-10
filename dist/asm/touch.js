"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.try_stat = exports.touch = exports.touch_options = void 0;
const interpreter_1 = require("#internal/interpreter");
const fs_1 = __importDefault(require("fs"));
const exception_1 = require("#internal/exception");
exports.touch_options = [
    {
        short: 'a',
        description: 'change only the access time'
    },
    {
        short: 'c', long: 'no-create',
        description: 'do not create any files'
    },
    {
        short: 'd', long: 'date', input: 'STRING',
        description: 'parse STRING and use it instead of current time'
    },
    {
        short: 'm',
        description: 'change only the modification time'
    },
    {
        short: 'r', long: 'reference', input: 'FILE',
        description: 'use this file\'s times instead of current time'
    }
];
const touch = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.touch_options, main, args);
    stdin.forEach(function processor(input) {
        const stat = (0, exports.try_stat)(input);
        if (stat?.isDirectory()) {
            return;
        }
        if (!stat && options.no_create) {
            throw new exception_1.InternalError(`touch: cannot access \`${input}\`: no such file or directory.`, undefined, 2);
        }
        fs_1.default.closeSync(fs_1.default.openSync(input, 'a'));
        const date = options.date ? new Date(options.date) : new Date();
        let mtime = date, atime = date;
        if (options.reference) {
            const references = (0, exports.try_stat)(options.reference);
            if (!references) {
                throw new exception_1.InternalError(`touch: failed to get attributes of \`${options.reference}\`: no such file or directory.`, undefined, 2);
            }
            mtime = references.mtime, atime = references.atime;
        }
        if (options.a && !options.m) {
            mtime = stat.mtime; // change access time only.
        }
        else if (options.m && !options.a) {
            atime = stat.atime; // change modification time only.
        }
        fs_1.default.utimesSync(input, atime, mtime);
    });
};
exports.touch = touch;
const try_stat = (main) => {
    try {
        return fs_1.default.statSync(main);
    }
    catch {
        return null;
    }
};
exports.try_stat = try_stat;
