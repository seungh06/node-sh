"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.basename = exports.restore = exports.load_sh = exports.access_module = exports.modules = exports.node = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.node = require('module');
exports.modules = {};
function access_module() {
    const main_config = require(path_1.default.resolve(module.path, '../tsconfig.json') // node-sh/tsconfig.json
    ).compilerOptions;
    const baseURL = path_1.default.resolve(module.path, '..', main_config.baseUrl);
    const dist = path_1.default.join(baseURL, main_config.outDir);
    for (const segment in main_config.paths) {
        exports.modules[(0, exports.restore)(segment)] = path_1.default.join(dist, (0, exports.restore)(main_config.paths[segment][0]));
    }
    const natives = {
        modules: exports.node.builtinModules,
        load: exports.node._resolveFilename
    };
    exports.node._resolveFilename = function (request, _parent, _isMain) {
        const native_request = natives.modules.includes(request);
        if (native_request)
            return natives.load.apply(this, arguments);
        const module = Object.keys(exports.modules)
            .find(module => request.includes(module));
        const modified = [
            module
                ? request.replace(module, exports.modules[module])
                : request,
            ...Array.prototype.slice.call(arguments, 1)
        ];
        return natives.load.apply(this, modified);
    };
}
exports.access_module = access_module;
function load_sh() {
    let commands = {};
    const baseURL = path_1.default.resolve(module.path, 'asm');
    for (const segment of fs_1.default.readdirSync(baseURL)) {
        if ((0, exports.basename)(segment) === 'exec')
            continue;
        const command = path_1.default.join(baseURL, segment);
        commands[(0, exports.basename)(command)] = require(command)[(0, exports.basename)(command)];
    }
    const internal = require('#assm/exec').default;
    for (const segement in commands) {
        internal[segement] = commands[segement];
    }
    global.$ = internal;
}
exports.load_sh = load_sh;
const restore = (path) => path.replace(/\/\*\/?/g, '');
exports.restore = restore;
const basename = (input) => path_1.default.basename(input).replace(/\.\w+$/, '');
exports.basename = basename;
void function setup() {
    access_module(), load_sh();
}();
exports.default = global.$;
