import * as defined from 'internal/defined'
import { InternalError } from 'internal/exception'
import { interpret } from 'internal/interpreter'
import { homedir } from 'node:os'
import fs from 'node:fs'

const node = [ '-node', 'cd' ];

export const cd: defined.asm<void> = (main, ...args) => {
        const { stdin } = interpret([ /* EMPTY OPTIONS */ ], main, args);

        if(stdin.length > 1) {
               throw new InternalError('too many arguments', undefined, 0, node);
        }

        let destination = stdin[0];
        switch(destination) {
                case '~':
                case '':
                        destination = homedir();
                        break;

                case '-':
                        if(!global.$.env.OLDPWD) {
                                throw new InternalError('cannot find previous directory.', undefined, 0, node);
                        }
                        destination = global.$.env.OLDPWD;
                        break;
        }

        try {
                global.$.env.OLDPWD = process.cwd();
                process.chdir(destination);
        } catch {
                if(!fs.existsSync(destination)) {
                        throw new InternalError(`\`${destination}\`: no such file or directory.`, undefined, 0, node);
                }

                if(!fs.statSync(destination).isDirectory()) {
                        throw new InternalError(`\`${destination}\`: is not a directory.`, undefined, 0, node);
                }
        }
}