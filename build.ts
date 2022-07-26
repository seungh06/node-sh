import path from 'node:path'
import fs from 'node:fs'

// predicators
const is_declaration = (value: string) => value.endsWith('d.ts');
const not_import = (value: string) => !value.startsWith('import');

// core
function load_declaration(path: string, tab: boolean = false) {
        return fs.readFileSync(path, 'utf-8').split('\n')
                .filter(not_import).join(tab ? '\n\t' : '\n')
}

function load_internal() {
        // node-sh/dist/internal
        const internal = path.join(module.path, 'internal');

        // declarations
        const defined = load_declaration(path.join(internal, 'defined.d.ts'), true);
        const extension = load_declaration(path.join(internal, 'extension.d.ts'));

        return [ 'declare namespace defined {', 
                        defined.replace(/declare /g, ''),
                '}', extension
        ].join('\n')
}

function clear_declaration() {
        const load_dts = (main: string = module.path) => {
                const res: Array<string> = [];
                const dirents = fs.readdirSync(main, { withFileTypes: true })
        
                for(const dirent of dirents) {
                        const absolute = path.join(main, dirent.name);
        
                        if(dirent.isDirectory()) res.push(...load_dts(absolute))
                        else res.push(absolute)
                }
        
                return res.filter(is_declaration);  
        }

        for(const dts of load_dts()) {
                const basename = path.basename(dts);
                if(basename === 'node-sh.d.ts') continue;

                fs.rmSync(dts);
        }
}


void function build() {
        const main = path.join(module.path, 'node-sh.d.ts');
        const main_declaration = load_declaration(main);
        
        const internal_declaration = load_internal();
        const composed = main_declaration + '\n' + internal_declaration;

        fs.writeFileSync(main, composed), clear_declaration()
}()