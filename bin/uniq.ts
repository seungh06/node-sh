import * as defined from 'internal/defined'
import { InternalError } from 'internal/exception'
import { UnixExtension } from 'internal/extension'
import { interpret } from 'internal/interpreter'
import fs from 'node:fs'

export const uniq_options: defined.binary_options = [
        {
                short: 'c', long: 'count',
                description: 'prefix lines by the number of occurrences'
        },

        {
                short: 'd', long: 'repeated',
                description: 'only print duplicate lines, one for each group'
        },

        {
                short: 'i', long: 'ignore-case',
                description: 'ignore differences in case when comparing'
        }
]

export const uniq: defined.asm<string> = (main, ...args) => {
        const { options, stdin } = interpret(uniq_options, main, args);

        if(stdin.length > 2) {
                throw new InternalError(`uniq: extra operand \`${ stdin[2] }\``);
        }

        const [ input, output ] = stdin;

        if(!fs.existsSync(input)) {
                throw new InternalError(`uniq: \`${input}\`: No such file or directory`);
        }

        if(fs.statSync(input).isDirectory()) {
                throw new InternalError(`uniq: error reading \`dist\``);
        }

        if(output && fs.existsSync(output) && fs.statSync(output).isDirectory()) {
                throw new InternalError(`uniq: \`${output}\`: Is a directory`);
        }

        const compare = (reference: string, compare: string) => {
                return options.ignore_case 
                        ? reference.toLocaleLowerCase().localeCompare(compare.toLocaleLowerCase())
                        : reference.localeCompare(compare);
        }

        const res = fs.readFileSync(input, 'utf-8').split('\n')
                .reduceRight<{ count: number, ln: string }[]>(function processor(output, line) {
                        if(output.length === 0) return [{ count: 1, ln: line }]
                        
                        const compared = compare(output[0].ln, line) === 0;
                        return compared ? [{ count: output[0].count + 1, ln: line }].concat(output.slice(1)) : [{ count: 1, ln: line }].concat(output);
                }, [])
                .filter(object => options.repeated ? object.count > 1 : true)
                .map(object => (options.count ? `${object.count.toString().padStart(7)} ` : '') + object.ln)
                .join('\n');
                
        if(output) fs.writeFileSync(output, res);
        return new UnixExtension(res);
}