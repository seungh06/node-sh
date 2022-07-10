"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniq = exports.uniq_options = void 0;
const interpreter_1 = require("internal/interpreter");
const fs_1 = __importDefault(require("fs"));
const exception_1 = require("internal/exception");
const extension_1 = require("internal/extension");
exports.uniq_options = [
    {
        short: 'c', long: 'count',
        description: 'prefix lines by the number of occurrences'
    },
    {
        short: 'd', long: 'repeated',
        description: 'only print duplicate lines, one for each group'
    },
    {
        short: 'i', long: 'ignore-case',
        description: 'ignore differences in case when comparing'
    }
];
const uniq = (main, ...args) => {
    const { options, stdin } = (0, interpreter_1.interpret)(exports.uniq_options, main, args);
    if (stdin.length > 2) {
        throw new exception_1.InternalError(`uniq: extra operand \`${stdin[2]}\``);
    }
    const [input, output] = stdin;
    if (!fs_1.default.existsSync(input)) {
        throw new exception_1.InternalError(`uniq: \`${input}\`: No such file or directory`);
    }
    if (fs_1.default.statSync(input).isDirectory()) {
        throw new exception_1.InternalError(`uniq: error reading \`dist\``);
    }
    if (output && fs_1.default.existsSync(output) && fs_1.default.statSync(output).isDirectory()) {
        throw new exception_1.InternalError(`uniq: \`${output}\`: Is a directory`);
    }
    const compare = (reference, compare) => {
        return options.ignore_case
            ? reference.toLocaleLowerCase().localeCompare(compare.toLocaleLowerCase())
            : reference.localeCompare(compare);
    };
    const res = fs_1.default.readFileSync(input, 'utf-8').split('\n')
        .reduceRight(function processor(output, line) {
        if (output.length === 0)
            return [{ count: 1, ln: line }];
        const compared = compare(output[0].ln, line) === 0;
        return compared ? [{ count: output[0].count + 1, ln: line }].concat(output.slice(1)) : [{ count: 1, ln: line }].concat(output);
    }, [])
        .filter(object => options.repeated ? object.count > 1 : true)
        .map(object => (options.count ? `${object.count.toString().padStart(7)} ` : '') + object.ln)
        .join('\n');
    if (output)
        fs_1.default.writeFileSync(output, res);
    return new extension_1.UnixExtension(res);
};
exports.uniq = uniq;
