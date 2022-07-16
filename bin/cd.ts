import * as defined from 'internal/defined'
import { InternalError } from 'internal/exception'
import { interpret } from 'internal/interpreter'
import { homedir } from 'node:os'
import fs from 'node:fs'

const node = [ '-node', 'cd' ];
export let previous_pwd: string | undefined;

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
                        if(!previous_pwd) {
                                throw new InternalError('cannot find previous directory.', undefined, 0, node);
                        }
                        destination = previous_pwd;
                        break;
        }

        try {
                previous_pwd = process.cwd();
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