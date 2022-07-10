import * as defined from 'internal/defined'
import { interpret } from 'internal/interpreter'
import stream from 'fs'
import { InternalError } from 'internal/exception'

export const rmdir_options: defined.sh_options = [
        {
                short: 'p', long: 'parents',
                description: 'remove DIRECTORY and its ancestors'
        }
]

export const rmdir: defined.sh<void> = (main, ...args) => {
        const { options, stdin } = interpret(rmdir_options, main, args);

        stdin.forEach(function processor(input) {
                if(!stream.existsSync(input)) {
                        throw new InternalError(`rmdir: failed to remove \`${input}\`': no such file or directory.`, undefined, 2);
                }

                if(!stream.statSync(input).isDirectory()) {
                        throw new InternalError(`rmdir: failed to remove \`${input}\`: is not a directory.`, undefined, 2);
                }

                if(stream.readdirSync(input).length >= 1) {
                        throw new InternalError(`rmdir: failed to remove \`${input}\`: directory not empty.`, undefined, 2);
                }

                if(options.parents) {
                        const roots = input.split('/');
                        const targets = roots.map(
                                function mapper(target, index) {
                                        const parent = roots.slice(0, index).join('/');
                                        return (parent ? parent + '/' : '' ) + target;
                                }
                        ).reverse()

                        for(const target of targets) {
                                if(stream.readdirSync(target).length >= 1) {
                                        throw new InternalError(`rmdir: failed to remove \`${target}\`: directory not empty.`, undefined, 2);
                                }

                                stream.rmdirSync(target);
                        }
                } else stream.rmdirSync(input);
        })
}