import * as defined from '#internal/defined'
import { interpret } from '#internal/interpreter'
import stream from 'fs'
import { InternalError } from '#internal/exception'

export const touch_options: defined.sh_options = [
        {
                short: 'a',
                description: 'change only the access time'
        },

        {
                short: 'c', long: 'no-create',
                description: 'do not create any files'
        },

        {
                short: 'd', long: 'date', input: 'STRING',
                description: 'parse STRING and use it instead of current time'
        },

        {
                short: 'm',
                description: 'change only the modification time'
        },

        {
                short: 'r', long: 'reference', input: 'FILE',
                description: 'use this file\'s times instead of current time'
        }
]

export const touch: defined.sh<void> = (main, ...args) => {
        const { options, stdin } = interpret(touch_options, main, args);

        stdin.forEach(function processor(input) {
                const stat = try_stat(input);

                if(stat?.isDirectory()) {
                        return
                }

                if(!stat && options.no_create) {
                        throw new InternalError(`touch: cannot access \`${input}\`: no such file or directory.`, undefined, 2);
                }

                stream.closeSync(stream.openSync(input, 'a'));

                const date = options.date ? new Date(options.date) : new Date();
                let mtime = date, atime = date;

                if(options.reference) {
                        const references = try_stat(options.reference);

                        if(!references) {
                                throw new InternalError(`touch: failed to get attributes of \`${options.reference}\`: no such file or directory.`, undefined, 2)
                        }

                        mtime = references.mtime, atime = references.atime;
                }

                if(options.a && !options.m) {
                        mtime = stat!!.mtime // change access time only.
                } else if(options.m && !options.a) {
                        atime = stat!!.atime // change modification time only.
                }

                stream.utimesSync(input, atime, mtime);
        })
}

export const try_stat = (main: string) => {
        try {
                return stream.statSync(main);
        } catch { return null }
}