import * as defined from '#internal/defined'
import path         from 'path'
import stream       from 'fs'

export const node   : Record<string, any>    = require('module');
export const modules: Record<string, string> = { };

export function access_module() {
        const main_config = require(
                path.resolve(module.path, '../tsconfig.json') // node-sh/tsconfig.json
        ).compilerOptions;

        const baseURL = path.resolve(module.path, '..', main_config.baseUrl);
        const dist    = path.join(baseURL, main_config.outDir);

        for(const segment in main_config.paths) {
                modules[ restore(segment) ] = path.join(
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
                                ? request.replace(module, modules[module])
                                : request,

                        ...Array.prototype.slice.call(arguments, 1)
                ];

                return natives.load.apply(this, modified);
        }
}

declare global {
        var $: defined.sh<string> & {
                env: {
                        verbose    : boolean
                        prefix     : string
                        shell      : string | boolean
                        max_buffer : number
                }
                
                cat  : defined.sh<string>  , head : defined.sh<string>  , tail : defined.sh<string>
                ls   : defined.sh<string[]>, cd   : defined.sh<void>    , pwd  : defined.sh<string>
                mkdir: defined.sh<void>    , rm   : defined.sh<void>    , rmdir: defined.sh<void>
                touch: defined.sh<void>    , grep : defined.sh<string[]>, chmod: defined.sh<void>
                dirs : defined.sh<string[]>, pushd: defined.sh<string[]>, popd : defined.sh<void>
                which: defined.sh<string>  , echo : defined.sh<string>  , mv   : defined.sh<void>
                uniq : defined.sh<string>  , sort : defined.sh<string>  , //ps   : defined.sh<string[]>
        }
}

export function load_sh() {
        let commands: Record<string, any> = { };
        const baseURL = path.resolve(module.path, 'asm');

        for(const segment of stream.readdirSync(baseURL)) {
                if(basename(segment) === 'exec') continue;

                const command = path.join(baseURL, segment);
                commands[ basename(command) ] = require(command)[ basename(command) ];
        }

        const internal: Record<string, any> = require('#assm/exec').default
        for(const segement in commands) {
                internal[segement as keyof typeof internal] = commands[segement];
        }
        global.$ = internal as typeof global.$;
}

export const restore = (path: string) => path.replace(/\/\*\/?/g, '');
export const basename = (input: string) => path.basename(input).replace(/\.\w+$/, '');

void function setup() {
        access_module(), load_sh()
}()

export default global.$;