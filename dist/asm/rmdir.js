"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rmdir = exports.rmdir_options = void 0;
const interpreter_1 = require("../internal/interpreter");
const fs_1 = __importDefault(require("fs"));
const exception_1 = require("../internal/exception");
exports.rmdir_options = [
    {
        short: 'p', long: 'parents',
        description: 'remove DIRECTORY and its ancestors'
    }
];
const rmdir = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.rmdir_options, main, args);
    stdin.forEach(function processor(input) {
        if (!fs_1.default.existsSync(input)) {
            throw new exception_1.InternalError(`rmdir: failed to remove \`${input}\`': no such file or directory.`, undefined, 2);
        }
        if (!fs_1.default.statSync(input).isDirectory()) {
            throw new exception_1.InternalError(`rmdir: failed to remove \`${input}\`: is not a directory.`, undefined, 2);
        }
        if (fs_1.default.readdirSync(input).length >= 1) {
            throw new exception_1.InternalError(`rmdir: failed to remove \`${input}\`: directory not empty.`, undefined, 2);
        }
        if (options.parents) {
            const roots = input.split('/');
            const targets = roots.map(function mapper(target, index) {
                const parent = roots.slice(0, index).join('/');
                return (parent ? parent + '/' : '') + target;
            }).reverse();
            for (const target of targets) {
                if (fs_1.default.readdirSync(target).length >= 1) {
                    throw new exception_1.InternalError(`rmdir: failed to remove \`${target}\`: directory not empty.`, undefined, 2);
                }
                fs_1.default.rmdirSync(target);
            }
        }
        else
            fs_1.default.rmdirSync(input);
    });
};
exports.rmdir = rmdir;
