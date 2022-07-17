"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
function delete_binary() {
    const binary = node_path_1.default.join(module.path, 'bin');
    const declarations = node_fs_1.default.readdirSync(binary).filter(is_declaration);
    for (const dts of declarations) {
        const target = node_path_1.default.join(binary, dts);
        node_fs_1.default.rmSync(target);
    }
}
function load_internal() {
    const internal = node_path_1.default.join(module.path, 'internal');
    const declarations = node_fs_1.default.readdirSync(internal).filter(is_declaration);
    const res = [];
    for (const dts of declarations) {
        const target = node_path_1.default.join(internal, dts);
        if (dts === 'defined.d.ts') {
            const defined = '\t' + load_declaration(target, true).replace(/ declare/g, '');
            res.push('declare namespace defined {', defined, '}');
        }
        if (dts === 'extension.d.ts') {
            const extension = load_declaration(target);
            res.push(extension);
        }
        node_fs_1.default.rmSync(target);
    }
    return res.join('\n');
}
function load_declaration(target, tab = false) {
    return node_fs_1.default.readFileSync(target, 'utf-8').split('\n').filter(not_import).join(tab ? '\n\t' : '\n');
}
const is_declaration = (input) => input.endsWith('d.ts');
const not_import = (input) => !input.startsWith('import');
void function build() {
    const main = node_path_1.default.join(module.path, 'node-sh.d.ts');
    const node_sh = load_declaration(main), internal = load_internal();
    delete_binary();
    node_fs_1.default.writeFileSync(main, `${node_sh}\n${internal}`);
}();
