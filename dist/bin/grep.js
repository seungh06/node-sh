"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_struct = exports.grep = exports.grep_options = void 0;
const exception_1 = require("internal/exception");
const extension_1 = require("internal/extension");
const interpreter_1 = require("internal/interpreter");
const posix_1 = __importDefault(require("node:path/posix"));
const node_fs_1 = __importDefault(require("node:fs"));
exports.grep_options = [
    {
        short: 'i', long: 'ignore-case',
        description: 'ignore case distinctions in patterns and data'
    },
    {
        short: 'v', long: 'invert-match',
        description: 'select non-matching lines'
    },
    {
        short: 'n', long: 'line-number',
        description: 'print line number with output lines'
    },
    {
        short: 'H', long: 'with-filename',
        description: 'print file name with output lines'
    },
    {
        short: 'r', long: 'recursive',
        description: 'read all files under each directory, recursively'
    },
    {
        short: 'l', long: 'files-with-matches',
        description: 'print only names of FILEs with selected lines'
    }
];
const grep = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.grep_options, main, args);
    const regex = new RegExp(stdin.shift() || '', options['ignore-case'] ? 'i' : '');
    const targets = stdin.map(function finder(input) {
        if (!node_fs_1.default.existsSync(input)) {
            throw new exception_1.InternalError(`grep: \`${input}\`: no such file or directory.`, undefined, 2);
        }
        if (node_fs_1.default.statSync(input).isDirectory()) {
            if (!options.recursive) {
                throw new exception_1.InternalError(`grep: \`${input}\`: is a directory.`, undefined, 2);
            }
            return get_struct(input);
        }
        else
            return input;
    }).flat();
    const res = targets.reduce(function processor(output, input) {
        const normal = posix_1.default.normalize(input);
        const content = node_fs_1.default.readFileSync(normal, 'utf-8');
        if (options.files_with_matches) {
            const match = content.match(regex);
            if (match && !options.invert_match || !match && options.invert_match) {
                output.push(normal);
            }
        }
        else {
            for (const [index, segment] of content.split('\n').entries()) {
                const match = segment.match(regex);
                if (match && !options.invert_match || !match && options.invert_match) {
                    const ln = options.line_number ? `${index + 1}:${segment}` : segment;
                    output.push(!options.no_filename && (stdin.length > 1 || options.recursive) ? `${normal}:${ln}` : ln);
                }
            }
        }
        return output;
    }, []);
    return new extension_1.UnixExtension(res);
};
exports.grep = grep;
function get_struct(root) {
    const res = [];
    const dirents = node_fs_1.default.readdirSync(root, { withFileTypes: true });
    for (const dirent of dirents) {
        const basename = posix_1.default.join(root, dirent.name);
        dirent.isDirectory() ? res.push(...get_struct(basename)) : res.push(basename);
    }
    return res;
}
exports.get_struct = get_struct;
