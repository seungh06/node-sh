"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnixExtension = exports.get_prototypes = void 0;
const interpreter_1 = require("./interpreter");
const grep_1 = require("../asm/grep");
const head_1 = require("../asm/head");
const tail_1 = require("../asm/tail");
const uniq_1 = require("../asm/uniq");
const sort_1 = require("../asm/sort");
class _UnixExtension {
    stdout;
    constructor(stdout) {
        this.stdout = stdout;
        const props = { ...get_prototypes(this), ...get_prototypes(stdout) };
        Object.setPrototypeOf(this, props); // merge prototypes -> typeof stdout + UnixExtension.
    }
    grep = (main, ...args) => {
        const { options, stdin } = (0, interpreter_1.interpret)(grep_1.grep_options, main, args);
        const regex = new RegExp(stdin.shift() || '', options['ignore-case'] ? 'i' : '');
        const output = [];
        if (options.files_with_matches) {
            output.push('(standard input)');
        }
        else {
            for (const [index, segment] of this.get_stdout().split('\n').entries()) {
                const match = segment.match(regex);
                if (match && !options.invert_match || !match && options.invert_match) {
                    const ln = options.line_number ? `${index + 1}:${segment}` : segment;
                    output.push(options.with_filename || options.recursive ? `(stardard input):${ln}` : ln);
                }
            }
        }
        return new exports.UnixExtension(output);
    };
    head = (main, ...args) => {
        const { options } = (0, interpreter_1.interpret)(head_1.head_options, main, args);
        const num = parseInt(options.lines || options.bytes) || 10;
        const sep = options.bytes ? '' : '\n';
        const res = this.get_stdout().split(sep).slice(0, num).join(sep);
        return new exports.UnixExtension(res);
    };
    tail = (main, ...args) => {
        const { options } = (0, interpreter_1.interpret)(tail_1.tail_options, main, args);
        const num = parseInt(options.lines || options.bytes) || 10;
        const sep = options.bytes ? '' : '\n';
        const pnv = (options.lines || options.bytes)?.[0] === '+';
        const value = pnv ? num - 1 : -1 * Math.abs(num);
        const res = this.get_stdout().split(sep).slice(value).join(sep);
        return new exports.UnixExtension(res);
    };
    uniq = (main, ...args) => {
        const { options } = (0, interpreter_1.interpret)(uniq_1.uniq_options, main, args);
        const compare = (reference, compare) => {
            return options.ignore_case
                ? reference.toLocaleLowerCase().localeCompare(compare.toLocaleLowerCase())
                : reference.localeCompare(compare);
        };
        const res = this.get_stdout().split('\n')
            .reduceRight(function processor(output, line) {
            if (output.length === 0)
                return [{ count: 1, ln: line }];
            const compared = compare(output[0].ln, line) === 0;
            return compared ? [{ count: output[0].count + 1, ln: line }].concat(output.slice(1)) : [{ count: 1, ln: line }].concat(output);
        }, [])
            .filter(object => options.repeated ? object.count > 1 : true)
            .map(object => (options.count ? `${object.count.toString().padStart(7)} ` : '') + object.ln)
            .join('\n');
        return new exports.UnixExtension(res);
    };
    sort = (main, ...args) => {
        const { options } = (0, interpreter_1.interpret)(sort_1.sort_options, main, args);
        const sorted = this.get_stdout().split('\n').sort(options.numeric_sort ? sort_1.numeric_sort : options.ignore_case ? sort_1.insentive_sort : sort_1.default_sort);
        const res = (options.reverse ? sorted.reverse() : sorted).join('\n');
        return new exports.UnixExtension(res);
    };
    get_stdout() {
        if (this.stdout instanceof Array) {
            return this.stdout.join('\n');
        }
        else
            return `${this.stdout}`;
    }
}
function get_prototypes(object) {
    const res = {};
    const protos = Object.getOwnPropertyNames(Object.getPrototypeOf(object));
    for (const proto of protos) {
        const segment = object[proto];
        res[proto] = segment instanceof Function ? segment.bind(object) : segment;
    }
    return res;
}
exports.get_prototypes = get_prototypes;
exports.UnixExtension = _UnixExtension;
