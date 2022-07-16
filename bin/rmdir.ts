import * as defined from 'internal/defined'
import { InternalError } from 'internal/exception'
import { interpret } from 'internal/interpreter'
import fs from 'node:fs'

export const rmdir_options: defined.binary_options = [
        {
                short: 'p', long: 'parents',
                description: 'remove DIRECTORY and its ancestors'
        }
]

export const rmdir: defined.asm<void> = (main, ...args) => {
        const { options, stdin } = interpret(rmdir_options, main, args);

        stdin.forEach(function processor(input) {
                if(!fs.existsSync(input)) {
                        throw new InternalError(`rmdir: failed to remove \`${input}\`': no such file or directory.`, undefined, 2);
                }

                if(!fs.statSync(input).isDirectory()) {
                        throw new InternalError(`rmdir: failed to remove \`${input}\`: is not a directory.`, undefined, 2);
                }

                if(fs.readdirSync(input).length >= 1) {
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
                                if(fs.readdirSync(target).length >= 1) {
                                        throw new InternalError(`rmdir: failed to remove \`${target}\`: directory not empty.`, undefined, 2);
                                }

                                fs.rmdirSync(target);
                        }
                } else fs.rmdirSync(input);
        })
}