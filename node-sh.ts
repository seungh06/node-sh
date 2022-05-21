import * as path    from 'path'
import * as stream  from 'fs'
import * as defined from 'internal/definition'

export const node   : Record<string, any>    = require('module');
export const modules: Record<string, string> = { };

export function access_module() {
        const main_config = require(
                path.resolve(module.path, '../tsconfig.json') // - node-sh/tsconfig.json
        ).compilerOptions;

        const baseURL = path.resolve(module.path, '..', main_config.baseUrl);
        const dist    = path.join(baseURL, main_config.outDir);

        for(const segment in main_config.paths) {
                modules[restore(segment)] = path.join(
                        dist, restore(main_config.paths[segment][0])
                )
        }

        const natives = {
                modules: node.builtinModules as string[],
                load   : node._resolveFilename as Function
        }

        node._resolveFilename = function(request: string, _parent: any, _isMain: boolean) {
                const native_request = natives.modules.includes(request);
                if(native_request) return natives.load.apply(this, arguments);

                const module = Object.keys(modules)
                        .find(module => request.includes(module));

                const modified = [
                        module
                                ? request.replace(module, modules[module]) // ex. @core/shell -> node-sh/dist/core/shell
                                : request,

                        ...Array.prototype.slice.call(arguments, 1)
                ];

                return natives.load.apply(this, modified);
        }
}

declare global {
        var $: defined.shx<string> & {
                env: {
                        verbose    : boolean
                        prefix     : string
                        shell      : string | boolean
                        max_buffer : number
                }

                cat  : defined.shx<string>, head: defined.shx<string> , tail: defined.shx<string>
                mkdir: defined.shx<void>  , rm  : defined.shx<void>   , 
                cd   : defined.shx<void>  , pwd : defined.unit<string>,
                which: defined.shx<string | string[]>, echo: defined.shx<string>
        }
}

export function load_shx() {
        let shx: Record<string, any> = { };
        const baseURL = path.resolve(module.path, 'shx');

        for(const segment of stream.readdirSync(baseURL)) {
                if(segment === 'exec.ts') continue; // exclude execute process command. 

                const command = path.join(baseURL, segment);

                shx = {
                        ...shx,
                        [ basename(command) ]: require(command)[ basename(command) ]
                }
        }

        const internal: Record<string, any> = require('./shx/exec').default;
        for(const segement in shx) {
                internal[segement as keyof typeof internal] = shx[segement];
        }

        global.$ = internal as typeof global.$;
}

export const restore = (path: string) => path.replace(/\/\*\/?/g, '');
export const basename = (input: string) => path.basename(input).replace(/\.\w+$/, '');

void function setup() {
        access_module(), load_shx()
}()