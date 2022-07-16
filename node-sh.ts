import * as defined from 'internal/defined'
import path from 'node:path'
import fs from 'node:fs'

export const node   : Record<string, any>    = require('module');
export const modules: Record<string, string> = { };

export function access_module() {
        const main_config = require(
                path.resolve(module.path, '..', 'tsconfig.json')
        ).compilerOptions;

        const dist = path.join(module.path, '..', main_config.outDir);

        for(const segment in main_config.paths) {
                modules[ header(segment) ] = path.join(
                        dist, header(main_config.paths[segment][0])
                )
        }

        const native = {
                modules: node.builtinModules as string[],
                load   : node._resolveFilename as Function
        }

        node._resolveFilename = function(request: string, _parent: any, _isMain: boolean) {
                const native_request = native.modules.includes(request);
                if(native_request) return native.load.apply(this, arguments);

                const module = Object.keys(modules)
                        .find(module => request.includes(module));

                const modified = [
                        module
                                ? request.replace(module, modules[module])
                                : request,

                        ...Array.prototype.slice.call(arguments, 1)
                ];

                return native.load.apply(this, modified);
        }
}

export const header = (path: string) => path.replace(/\/\*/g, '');

declare global {
        var $: defined.asm<string> & {
                env: {
                        verbose    : boolean
                        prefix     : string
                        shell      : string | boolean
                        max_buffer : number
                }
                
                cat  : defined.asm<string>  , head : defined.asm<string>  , tail  : defined.asm<string>
                ls   : defined.asm<string[]>, cd   : defined.asm<void>    , pwd   : defined.asm<string>
                mkdir: defined.asm<void>    , rm   : defined.asm<void>    , rmdir : defined.asm<void>
                touch: defined.asm<void>    , grep : defined.asm<string[]>, chmod : defined.asm<void>
                dirs : defined.asm<string[]>, pushd: defined.asm<string[]>, popd  : defined.asm<void>
                which: defined.asm<string>  , echo : defined.asm<string>  , mv    : defined.asm<void>
                uniq : defined.asm<string>  , sort : defined.asm<string>  , whoami: defined.asm<string>
                cp   : defined.asm<void>
        }
}

export function load_binary() {
        const commands: Record<string, any> = { };
        const baseURL = path.resolve(module.path, 'bin');

        for(const segment of fs.readdirSync(baseURL)) {
                if(basename(segment) === 'exec') continue;

                const command = path.join(baseURL, segment);
                commands[ basename(command) ] = require(command)[ basename(command) ];
        }

        const internal: Record<string, any> = require('binary/exec').default;
        for(const segment in commands) {
                internal[segment as keyof typeof internal] = commands[segment];
        }

        global.$ = internal as typeof global.$;
}

export const basename = (input: string) => path.basename(input).replace(/\.\w+$/, '');

void function main() {
        access_module(), load_binary();
}()

export default global.$;