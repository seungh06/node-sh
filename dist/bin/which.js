"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.which = exports.isWindows = exports.which_options = void 0;
const extension_1 = require("internal/extension");
const interpreter_1 = require("internal/interpreter");
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
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
    const res = stdin.reduce(function processor(output, input) {
        environments.forEach(env => extensions.forEach(extension => {
            if (output.length > 0 && !options.all)
                return output;
            const target = node_path_1.default.join(env, input) + extension;
            if (node_fs_1.default.existsSync(target) && node_fs_1.default.statSync(target).isFile())
                output.push(target);
        }));
        return output;
    }, []).join('\n');
    return new extension_1.UnixExtension(res);
};
exports.which = which;
