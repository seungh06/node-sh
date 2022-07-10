"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const exception_1 = require("../internal/exception");
const extension_1 = require("../internal/extension");
function $(main, ...args) {
    const cli = args.reduce(function reducer(previous, current, index) {
        const input = Array.isArray(current) ? current.join(' ') : current;
        return previous + input + main[index + 1];
    }, main[0]);
    const subprocess = (0, child_process_1.spawnSync)($.env.prefix + cli, {
        encoding: 'utf-8',
        cwd: process.cwd(),
        shell: $.env.shell || true,
        maxBuffer: $.env.max_buffer,
        windowsHide: true,
    });
    if (subprocess.status !== 0) {
        throw new exception_1.InternalError(`${subprocess.stderr} \nexit code: ${subprocess.status}`);
    }
    return new extension_1.UnixExtension(subprocess.stdout);
}
exports.default = $;
$.env = {
    verbose: false,
    prefix: '',
    shell: true,
    max_buffer: 200 * 1024 * 1024
};
