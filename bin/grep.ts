import * as defined from 'internal/defined'
import { InternalError } from 'internal/exception'
import { UnixExtension } from 'internal/extension'
import { interpret } from 'internal/interpreter'
import path from 'node:path/posix'
import fs from 'node:fs'

export const grep_options: defined.binary_options = [
        {
                short: 'i', long: 'ignore-case',
                description: 'ignore case distinctions in patterns and data'
        },

        {
                short: 'v', long: 'invert-match',
                description: 'select non-matching lines'
        },

        {
                short: 'n', long: 'line-number',
                description: 'print line number with output lines'
        },

        {
                short: 'H', long: 'with-filename',
                description: 'print file name with output lines'
        },

        {
                short: 'r', long: 'recursive',
                description: 'read all files under each directory, recursively'
        },

        {
                short: 'l', long: 'files-with-matches',
                description: 'print only names of FILEs with selected lines'
        }
]

export const grep: defined.asm<string[]> = (main, ...args) => {
        const { options, stdin } = interpret(grep_options, main, args);

        const regex = new RegExp(stdin.shift() || '', options['ignore-case'] ? 'i' : '');
        const targets = stdin.map(function finder(input) {
                if(!fs.existsSync(input)) {
                        throw new InternalError(`grep: \`${input}\`: no such file or directory.`, undefined, 2);
                }

                if(fs.statSync(input).isDirectory()) {
                        if(!options.recursive) {
                                throw new InternalError(`grep: \`${input}\`: is a directory.`, undefined, 2);
                        }

                        return get_struct(input)
                } else return input ;
        }).flat()

        const res = targets.reduce<string[]>(function processor(output, input) {
                const normal  = path.normalize(input);
                const content = fs.readFileSync(normal, 'utf-8');

                if(options.files_with_matches) {
                        const match = content.match(regex);

                        if(match && !options.invert_match || !match && options.invert_match) {
                                output.push(normal);
                        }
                } else {

                        for(const [ index, segment ] of content.split('\n').entries()) {
                                const match = segment.match(regex);

                                if(match && !options.invert_match || !match && options.invert_match) {
                                        const ln = options.line_number ? `${ index + 1 }:${segment}` : segment
                                        output.push(!options.no_filename && (stdin.length > 1 || options.recursive) ? `${normal}:${ln}` : ln);
                                }
                        }
                        
                }
                return output;
        }, [])

        return new UnixExtension(res)
}

export function get_struct(root: string) {
        const res: Array<string> = [ ];
        const dirents = fs.readdirSync(root, { withFileTypes: true });

        for(const dirent of dirents) {
                const basename = path.join(root, dirent.name);
                dirent.isDirectory() ? res.push(...get_struct(basename)) : res.push(basename);
        }

        return res;
}