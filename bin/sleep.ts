import * as defined from 'internal/defined'
import { InternalError } from 'internal/exception'
import { interpret } from 'internal/interpreter'

export const sleep: defined.asm<void> = (main, ...args) => {
        const { stdin } = interpret([ /* EMPTY OPTIONS */ ], main, args);

        if(stdin.length <= 0) {
                throw new InternalError('sleep: missing operand');
        }
        const input = stdin[0];
        const matches = input.match(/(\d*)(\w)?/);

        if(!matches || matches?.[1] === '') {
                throw new InternalError(`sleep: invalid time interval \`${input}\``);
        }

        let time = parseInt(matches[1]), suffix = matches[2]; 
        switch(suffix) {
                case `m`:
                        time *= (1000 * 60);
                        break;

                case `h`:
                        time *= (1000 * 60 * 60);
                        break;

                case 'd':
                        time *= (1000 * 60 * 60 * 24);
                        break;

                default:
                        time *= 1000
        }

        const wakeup = Date.now() + time;
        while(Date.now() < wakeup) { }
}