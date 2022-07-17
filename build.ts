import path from 'node:path'
import fs from 'node:fs'

function delete_binary() {
        const binary = path.join(module.path, 'bin');
        const declarations = fs.readdirSync(binary).filter(is_declaration);

        for(const dts of declarations) {
                const target = path.join(binary, dts);
                fs.rmSync(target);
        }
}

function load_internal() {
        const internal = path.join(module.path, 'internal');
        const declarations = fs.readdirSync(internal).filter(is_declaration);

        const res: Array<string> = [];
        for(const dts of declarations) {
                const target = path.join(internal, dts);

                if(dts === 'defined.d.ts') {
                        const defined = '\t' + load_declaration(target, true).replace(/ declare/g, '');
                        res.push('declare namespace defined {', defined, '}');
                }

                if(dts === 'extension.d.ts') {
                        const extension = load_declaration(target);
                        res.push(extension);
                }
                fs.rmSync(target);
        }
        return res.join('\n');
}

function load_declaration(target: string, tab: boolean = false) {
        return fs.readFileSync(target, 'utf-8').split('\n').filter(not_import).join(tab ? '\n\t' : '\n')
}

const is_declaration = (input: string) => input.endsWith('d.ts');
const not_import = (input: string) => !input.startsWith('import');

void function build() {
        const main = path.join(module.path, 'node-sh.d.ts');
        const node_sh = load_declaration(main), internal = load_internal();

        delete_binary();
        fs.writeFileSync(main, `${node_sh}\n${internal}`);
}()
