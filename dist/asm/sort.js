"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.numeric_sort = exports.insentive_sort = exports.default_sort = exports.sort = exports.sort_options = void 0;
const interpreter_1 = require("core/interpreter");
const fs_1 = __importDefault(require("fs"));
const exception_1 = require("core/exception");
const extension_1 = require("core/extension");
exports.sort_options = [
    {
        short: 'f', long: 'ignore-case',
        description: 'fold lower case to upper case characters'
    },
    {
        short: 'n', long: 'numeric-sort',
        description: 'compare according to string numerical value'
    },
    {
        short: 'r', long: 'reverse',
        description: 'reverse the result of comparisons'
    }
];
const sort = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.sort_options, main, args);
    const content = stdin.reduce(function reducer(output, input) {
        if (!fs_1.default.existsSync(input)) {
            throw new exception_1.InternalError(`sort: cannot read: \`${input}\`: No such file or directory`, undefined, 2);
        }
        if (fs_1.default.statSync(input).isDirectory()) {
            throw new exception_1.InternalError(`sort: read failed: \`${input}\`: is a directory`, undefined, 2);
        }
        return output.concat(fs_1.default.readFileSync(input, 'utf-8').split('\n'));
    }, []);
    const sorted = content.sort(options.numeric_sort ? numeric_sort : options.ignore_case ? insentive_sort : default_sort);
    const res = (options.reverse ? sorted.reverse() : sorted).join('\n');
    return new extension_1.UnixExtension(res);
};
exports.sort = sort;
function default_sort(reference, compare) {
    if (reference < compare)
        return -1;
    if (reference > compare)
        return 1;
    return 0;
}
exports.default_sort = default_sort;
function insentive_sort(reference, compare) {
    const ref = reference.toLowerCase(), cmp = compare.toLowerCase();
    return ref === cmp
        ? -1 * reference.localeCompare(compare)
        : ref.localeCompare(cmp);
}
exports.insentive_sort = insentive_sort;
function numeric_sort(reference, compare) {
    const ref = parseInt(reference), cmp = parseInt(compare);
    if (!isNaN(ref) && !isNaN(cmp)) {
        return ref !== cmp ? ref - cmp : default_sort(reference, compare);
    }
    else
        return default_sort(reference, compare);
}
exports.numeric_sort = numeric_sort;
