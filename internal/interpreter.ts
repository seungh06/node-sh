import * as defined from 'internal/defined'
import { InternalError } from 'internal/exception'
import wcm from 'internal/wcm'

export function interpret(token: defined.binary_options, main: TemplateStringsArray, args: Array<any>) {
        const shell = args.reduce<string>(
                function reducer(previous, current, index) {
                        const input = Array.isArray(current) ? current.map(element => `'${element}'`).join(' ') : current;
                        return previous + input + main[index + 1];
                }, main[0]
        )

        let sync_options: defined.binary_option | undefined;
        const options: Record<string, any> = {}, inputs: Array<string> = [];

        division(shell).forEach(function processor(segment, index, object) {
                const decomposed = segment.match(/(--|-)([a-zA-Z]*(?:-[a-zA-Z]*)?)/);

                if(decomposed instanceof Array && decomposed[0] !== decomposed[1] && segment.startsWith('-') && token.length > 0) {
                        const inputs = decomposed[1].length === 1 ? decomposed[2].split('') : [ decomposed[2] ] ;
                        for(const input of inputs) {
                                const found = token.find(token => {
                                        return token.short === input || token.long === input 
                                        || ( token.short instanceof Array && token.short.includes(input) )
                                        || ( token.long instanceof Array && token.long.includes(input) )
                                });

                                if(found === undefined) {
                                        throw new InternalError(`'${input}' option is not recognized.`, `Implemented options:\n${generate_man(token)}`, 3);
                                }
                                
                                found.input ? sync_options = found : options[ get_head(found) ] = true;
                        }
                } else if(sync_options) {
                        options[ get_head(sync_options) ] = compose(object, index), sync_options = undefined;
                } else {
                        let composed = compose(object, index);
                        const include_env = composed.includes('$');

                        if(include_env) {
                                Object.keys(global.$.env).forEach(env => {
                                        composed = composed.replaceAll(`$` + env, global.$.env[env]);
                                })
                        }

                        const glob = global.$.env.noglob ? [ composed ] : wcm(composed);
                        inputs.push(...glob);
                }
        })

        return { options, stdin: inputs };
}

export const division = (main: string, separator: string = ' ') => {
        return main.split(separator).filter(element => element);
}

export function compose(object: Array<string>, index: number) {
        const is_sequence = object[index].startsWith(`'`);

        if(is_sequence) {
                const position = object.slice(index).findIndex(element => element.endsWith(`'`));
                if(position > -1) {
                        return object.splice(index, position + 1, 'COMPILED INDEX').join(' ').slice(1, -1);
                }
        }

        return object[index];
}

export const get_head = (option: defined.binary_option) => {
        return option.long && ( typeof option.long === 'string' || option.long.length === 1)
                ? (<string> option.long).replaceAll('-', '_')
                : option.short!!.toString().replaceAll(',', '_')
}

export function generate_man(token: defined.binary_options) {
        return token.map(function mapper(option) {
                const short = option.short ? `-${ typeof option.short === 'string' ? option.short : option.short.join(', -') }` : '';
                const long = option.long ? `--${ typeof option.long === 'string' ? option.long : option.long.join(', --') }` : '';

                const comma = short && long ? ', ' : '    ';
                const input = option.input ? `=${option.input}`: '';

                return `\t${short}${comma}${long}${input}`.padEnd(25) + option.description?.replaceAll('\n', '\n\t' + ' '.repeat(25));
        }).join('\n')
}