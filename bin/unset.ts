import * as defined from 'internal/defined'
import { interpret } from 'internal/interpreter'

export const unset: defined.asm<void> = (main, ...args) => {
        const { stdin } = interpret([ /* EMPTY OPTIONS */ ], main, args);

        stdin.forEach(env => delete global.$.env[env]);
} 