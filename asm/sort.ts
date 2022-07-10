import * as defined from '#internal/defined'
import { interpret } from '#internal/interpreter'
import stream from 'fs'
import { InternalError } from '#internal/exception'
import { UnixExtension } from '#internal/extension'

export const sort_options: defined.sh_options = [
        {
                short: 'f', long: 'ignore-case',
                description: 'fold lower case to upper case characters'
        },

        {
                short: 'n', long: 'numeric-sort',
                description: 'compare according to string numerical value'
        },

        {
                short: 'r', long: 'reverse',
                description: 'reverse the result of comparisons'
        }
]

export const sort: defined.sh<string> = (main, ...args) => {
        const { options, stdin } = interpret(sort_options, main, args);

        const content = stdin.reduce<string[]>(function reducer(output, input) {
                if(!stream.existsSync(input)) {
                        throw new InternalError(`sort: cannot read: \`${input}\`: No such file or directory`, undefined, 2);
                }

                if(stream.statSync(input).isDirectory()) {
                        throw new InternalError(`sort: read failed: \`${input}\`: is a directory`, undefined, 2);
                }

                return output.concat(stream.readFileSync(input, 'utf-8').split('\n'));
        }, []);

        const sorted = content.sort(options.numeric_sort ? numeric_sort : options.ignore_case ? insentive_sort : default_sort);
        const res = (options.reverse ? sorted.reverse() : sorted).join('\n');

        return new UnixExtension(res);
}

export function default_sort(reference: string, compare: string) {
        if(reference < compare) return -1
        if(reference > compare) return 1
        return 0
}

export function insentive_sort(reference: string, compare: string) {
        const ref = reference.toLowerCase(), cmp = compare.toLowerCase();
        return ref === cmp
                ? -1 * reference.localeCompare(compare)
                : ref.localeCompare(cmp);
}

export function numeric_sort(reference: string, compare: string) {
        const ref = parseInt(reference), cmp = parseInt(compare);

        if(!isNaN(ref) && !isNaN(cmp)) {
                return ref !== cmp ? ref - cmp : default_sort(reference, compare)
        } else return default_sort(reference, compare)
}