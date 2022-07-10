"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cd = exports.previous_pwd = void 0;
const fs_1 = __importDefault(require("fs"));
const exception_1 = require("core/exception");
const interpreter_1 = require("core/interpreter");
const os_1 = require("os");
const node = ['-node', 'cd'];
const cd = (main, ...args) => {
    const { stdin } = (0, interpreter_1.interpret)([ /* EMPTY OPTIONS */], main, args);
    if (stdin.length > 1) {
        throw new exception_1.InternalError('too many arguments', undefined, 0, node);
    }
    let destination = stdin[0];
    switch (destination) {
        case '~':
        case '':
            destination = (0, os_1.homedir)();
            break;
        case '-':
            if (!exports.previous_pwd) {
                throw new exception_1.InternalError('cannot find previous directory.', undefined, 0, node);
            }
            destination = exports.previous_pwd;
            break;
    }
    try {
        exports.previous_pwd = process.cwd();
        process.chdir(destination);
    }
    catch {
        if (!fs_1.default.existsSync(destination)) {
            throw new exception_1.InternalError(`\`${destination}\`: no such file or directory.`, undefined, 0, node);
        }
        if (!fs_1.default.statSync(destination).isDirectory()) {
            throw new exception_1.InternalError(`\`${destination}\`: is not a directory.`, undefined, 0, node);
        }
    }
};
exports.cd = cd;
