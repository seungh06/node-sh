"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_struct = exports.generate = void 0;
const posix_1 = __importDefault(require("node:path/posix"));
const node_fs_1 = __importDefault(require("node:fs"));
function generate(glob) {
    const symbols = ['/', '$', '^', '+', '.', '(', ')', '=', '!', '|'];
    let generated = '', group = false;
    glob.split('').forEach(function generator(character, index, origin) {
        if (symbols.includes(character)) {
            generated += `\\${character}`;
            return;
        }
        switch (character) {
            case '?':
                generated += '.';
                break;
                ;
            case '{':
                group = true;
                generated += '(';
                break;
            case '}':
                group = false;
                generated += ')';
                break;
            case ',':
                generated += group ? '|' : `\\${character}`;
                break;
            case '*':
                generated += '([^\/]*)';
                break;
            default:
                generated += character;
        }
    });
    return generated;
}
exports.generate = generate;
function get_struct(root) {
    const res = [];
    const dirents = node_fs_1.default.readdirSync(root, { withFileTypes: true });
    for (const dirent of dirents) {
        if (dirent.name === 'node_modules')
            continue; // ignore node_modules
        const basename = posix_1.default.join(root, dirent.name);
        if (dirent.isDirectory())
            res.push(basename, ...get_struct(basename));
        else
            res.push(basename);
    }
    return res;
}
exports.get_struct = get_struct;
function wcm(glob, flag = '') {
    const regex = new RegExp(`^${generate(glob)}$`, flag);
    const res = get_struct('.').filter(input => regex.test(input));
    return res.length > 0 ? res : [glob];
}
exports.default = wcm;
