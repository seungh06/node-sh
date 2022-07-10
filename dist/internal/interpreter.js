"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_man = exports.get_head = exports.compose = exports.division = exports.interpret = void 0;
const wcm_1 = __importDefault(require("core/wcm"));
const exception_1 = require("core/exception");
function interpret(token, main, args) {
    const shell = args.reduce(function reducer(previous, current, index) {
        const input = Array.isArray(current) ? current.map(element => `'${element}'`).join(' ') : current;
        return previous + input + main[index + 1];
    }, main[0]);
    let sync_options;
    const options = {}, inputs = [];
    (0, exports.division)(shell).forEach(function processor(segment, index, object) {
        const decomposed = segment.match(/(--|-)([a-zA-Z]*(?:-[a-zA-Z]*)?)/);
        if (decomposed instanceof Array && decomposed[0] !== decomposed[1] && segment.startsWith('-')) {
            const inputs = decomposed[1].length === 1 ? decomposed[2].split('') : [decomposed[2]];
            for (const input of inputs) {
                const found = token.find(token => {
                    return token.short === input || token.long === input
                        || (token.short instanceof Array && token.short.includes(input))
                        || (token.long instanceof Array && token.long.includes(input));
                });
                if (found === undefined) {
                    throw new exception_1.InternalError(`'${input}' option is not recognized.`, `Implemented options:\n${generate_man(token)}`, 3);
                }
                found.input ? sync_options = found : options[(0, exports.get_head)(found)] = true;
            }
        }
        else if (sync_options) {
            options[(0, exports.get_head)(sync_options)] = compose(object, index), sync_options = undefined;
        }
        else
            inputs.push(...(0, wcm_1.default)(compose(object, index)));
    });
    return { options, stdin: inputs };
}
exports.interpret = interpret;
const division = (main, separator = ' ') => {
    return main.split(separator).filter(element => element);
};
exports.division = division;
function compose(object, index) {
    const is_sequence = object[index].startsWith(`'`);
    if (is_sequence) {
        const position = object.slice(index).findIndex(element => element.endsWith(`'`));
        if (position > -1) {
            return object.splice(index, position + 1, 'COMPILED INDEX').join(' ').slice(1, -1);
        }
    }
    return object[index];
}
exports.compose = compose;
const get_head = (option) => {
    return option.long && (typeof option.long === 'string' || option.long.length === 1)
        ? option.long.replaceAll('-', '_')
        : option.short.toString().replaceAll(',', '_');
};
exports.get_head = get_head;
function generate_man(token) {
    return token.map(function mapper(option) {
        const short = option.short ? `-${typeof option.short === 'string' ? option.short : option.short.join(', -')}` : '';
        const long = option.long ? `--${typeof option.long === 'string' ? option.long : option.long.join(', --')}` : '';
        const comma = short && long ? ', ' : '    ';
        const input = option.input ? `=${option.input}` : '';
        return `\t${short}${comma}${long}${input}`.padEnd(25) + option.description?.replaceAll('\n', '\n\t' + ' '.repeat(25));
    }).join('\n');
}
exports.generate_man = generate_man;
