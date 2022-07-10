"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.which = exports.isWindows = exports.which_options = void 0;
const extension_1 = require("../internal/extension");
const interpreter_1 = require("../internal/interpreter");
const posix_1 = __importDefault(require("path/posix"));
const fs_1 = __importDefault(require("fs"));
exports.which_options = [
    {
        short: 'a', long: 'all',
        description: 'Print all matching executables in PATH, not just the first'
    }
];
exports.isWindows = process.platform === 'win32'
    || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';
const which = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.which_options, main, args);
    const seperator = exports.isWindows ? ';' : ':';
    const environments = [exports.isWindows ? process.cwd() : '', ...process.env.PATH?.split(seperator) || ''];
    const extensions = (exports.isWindows ? process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD' : '').toLowerCase().split(seperator);
    const res = stdin.map(function processor(input) {
        const matches = [];
        environments.forEach(environment => {
            if (matches.length > 0 && !options.all)
                return;
            const parent = posix_1.default.join(environment, input);
            extensions.forEach(extension => {
                const path = parent + extension;
                if (fs_1.default.existsSync(path) && fs_1.default.statSync(path).isFile()) {
                    matches.push(path);
                }
            });
        });
        return matches;
    }).flat().join('\n');
    return new extension_1.UnixExtension(res);
};
exports.which = which;
