import * as defined from 'internal/defined'
import { UnixExtension } from 'internal/extension'
import { interpret } from 'internal/interpreter'

export const set_options: defined.binary_options = [
        {
                short: 'f',
                description: 'Disable file name generation (globbing).'
        },

        {
                short: 'v',
                description: 'Print shell input lines as they are read.'
        },

        {
                short: 'C',
                description: 'If set, disallow existing regular files to be overwritten\nby redirection of output.'
        }
]

export const set: defined.asm<void> = (main, ...args) => {
        const { options, stdin } = interpret(set_options, main, args);

        if(stdin.length <= 0 && Object.keys(options).length <= 0) {
                return new UnixExtension(stringify(global.$.env));
        }

        if(options.f) global.$.env.noglob    = true;
        if(options.v) global.$.env.verbose   = true;
        if(options.C) global.$.env.noclobber = true;

        stdin.forEach(function processor(input) {
                if(input.startsWith('+')) {
                        const flags = input.slice(1).split('');

                        for(const flag of flags) {
                                if(flag === 'f') global.$.env.noglob    = false;
                                if(flag === 'v') global.$.env.verbose   = false;
                                if(flag === 'C') global.$.env.noclobber = false;
                        }
                }

                if(input.includes('=')) {
                        const [ variable, value ] = input.split('=');
                        global.$.env[variable] = value;
                }
        })

}

export function stringify(env: Record<string, any>) {
        return Object.keys(env).map(key => `${key}=${env[key]}`);
}