import * as defined from 'core/defined'
import path from 'path/posix'
import stream from 'fs'
import { interpret } from 'core/interpreter'
import { InternalError } from 'core/exception'
import { UnixExtension } from 'core/extension'

export const grep_options: defined.sh_options = [
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

export const grep: defined.sh<string[]> = (main, ...args) => {
        const { options, stdin } = interpret(grep_options, main, args);

        const regex = new RegExp(stdin.shift() || '', options['ignore-case'] ? 'i' : '');
        const targets = stdin.map(function finder(input) {
                if(!stream.existsSync(input)) {
                        throw new InternalError(`grep: \`${input}\`: no such file or directory.`, undefined, 2);
                }

                if(stream.statSync(input).isDirectory()) {
                        if(!options.recursive) {
                                throw new InternalError(`grep: \`${input}\`: is a directory.`, undefined, 2);
                        }

                        return get_struct(input)
                } else return input ;
        }).flat()

        const res = targets.reduce<string[]>(function processor(output, input) {
                const normal  = path.normalize(input);
                const content = stream.readFileSync(normal, 'utf-8');

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

        const dirents = stream.readdirSync(root, { withFileTypes: true });
        for(const dirent of dirents) {
                const basename = path.join(root, dirent.name);

                if(dirent.isDirectory()) res.push(...get_struct(basename))
                else res.push(basename);
        }
        return res;
}