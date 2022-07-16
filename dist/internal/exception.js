"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalError = exports.constants = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
exports.constants = {
    RESET: '\x1b[0m', NEW_LINE: '\n', TAB: '\t',
    BG_RED: '\x1b[41m', FG_WHITE: '\x1b[97m', FG_GRAY: '\x1b[90m'
};
class InternalError extends Error {
    constructor(message, suggest = '', depth = 0, node = []) {
        super(message);
        const { func, storage, line } = this.load_traces(depth);
        const node_string = node.length ? node.join(': ') + ': ' : '';
        this.stack = [
            this.get_header(storage, line), this.render(storage, parseInt(line)), this.get_body(node_string, suggest)
        ].join(exports.constants.NEW_LINE + exports.constants.TAB);
    }
    load_traces(depth) {
        const stacks = this.stack.split(/^\s*at\s/m)[depth + 2].trim()
            .split(/(?:(.+?)\s+\()?(?:(.+?):(\d+):(\d+)\))/);
        return { func: stacks[1], storage: stacks[2], line: stacks[3] };
    }
    render_code(storage, line) {
        const content = node_fs_1.default.readFileSync(storage, 'utf-8').replace(/\r/g, '').split('\n');
        const code = content.map(function mapper(input, index) {
            const num_color = index + 1 === line ? exports.constants.BG_RED + exports.constants.FG_WHITE : exports.constants.FG_GRAY;
            return `${num_color}${(`     ${index + 1}`).slice(-6)}: ${exports.constants.FG_WHITE}${input}`;
        }).filter((_, index) => index < line + 4 && index > line - 5);
        const max_spaces = code.reduce(function reducer(max, value) {
            return max.length < value.length ? value : max;
        }).length;
        return code.map(content => content + ' '.repeat(max_spaces - content.length) + exports.constants.RESET).join(exports.constants.NEW_LINE + exports.constants.TAB);
    }
    get_header(storage, line) {
        return [
            exports.constants.NEW_LINE.repeat(2) + exports.constants.TAB + exports.constants.FG_WHITE + 'node-sh',
            exports.constants.FG_GRAY + node_path_1.default.basename(storage) + ':' + line + exports.constants.NEW_LINE
        ].join(exports.constants.NEW_LINE + exports.constants.TAB);
    }
    render(storage, line) {
        return this.render_code(storage, line) + exports.constants.NEW_LINE;
    }
    get_body(node, suggest) {
        return [
            exports.constants.FG_WHITE + '• ' + node + this.message.replaceAll(exports.constants.NEW_LINE, exports.constants.NEW_LINE + exports.constants.TAB) + exports.constants.RESET,
            suggest.replaceAll(exports.constants.NEW_LINE, exports.constants.NEW_LINE + exports.constants.TAB) + exports.constants.NEW_LINE
        ].join(exports.constants.NEW_LINE + exports.constants.TAB);
    }
}
exports.InternalError = InternalError;
