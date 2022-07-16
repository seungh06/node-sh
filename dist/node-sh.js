"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.basename = exports.load_binary = exports.header = exports.access_module = exports.modules = exports.node = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
exports.node = require('module');
exports.modules = {};
function access_module() {
    const main_config = require(node_path_1.default.resolve(module.path, '..', 'tsconfig.json')).compilerOptions;
    const dist = node_path_1.default.join(module.path, '..', main_config.outDir);
    for (const segment in main_config.paths) {
        exports.modules[(0, exports.header)(segment)] = node_path_1.default.join(dist, (0, exports.header)(main_config.paths[segment][0]));
    }
    const native = {
        modules: exports.node.builtinModules,
        load: exports.node._resolveFilename
    };
    exports.node._resolveFilename = function (request, _parent, _isMain) {
        const native_request = native.modules.includes(request);
        if (native_request)
            return native.load.apply(this, arguments);
        const module = Object.keys(exports.modules)
            .find(module => request.includes(module));
        const modified = [
            module
                ? request.replace(module, exports.modules[module])
                : request,
            ...Array.prototype.slice.call(arguments, 1)
        ];
        return native.load.apply(this, modified);
    };
}
exports.access_module = access_module;
const header = (path) => path.replace(/\/\*/g, '');
exports.header = header;
function load_binary() {
    const commands = {};
    const baseURL = node_path_1.default.resolve(module.path, 'bin');
    for (const segment of node_fs_1.default.readdirSync(baseURL)) {
        if ((0, exports.basename)(segment) === 'exec')
            continue;
        const command = node_path_1.default.join(baseURL, segment);
        commands[(0, exports.basename)(command)] = require(command)[(0, exports.basename)(command)];
    }
    const internal = require('binary/exec').default;
    for (const segment in commands) {
        internal[segment] = commands[segment];
    }
    global.$ = internal;
}
exports.load_binary = load_binary;
const basename = (input) => node_path_1.default.basename(input).replace(/\.\w+$/, '');
exports.basename = basename;
void function main() {
    access_module(), load_binary();
}();
exports.default = global.$;
