import * as defined from 'internal/defined'
import { UnixExtension } from 'internal/extension'
import { interpret } from 'internal/interpreter'

export const echo_options: defined.binary_options = [
        {
                short: 'n', 
                description: 'do not output the trailing newline'
        },
        
        {
                short: 'e',
                description: 'enable interpretation of backslash escapes'
        }
]

export const echo: defined.asm<string> = (main, ...args) => {
        const { options, stdin } = interpret(echo_options, main, args);
        
        const output = stdin.join(' ') + (options.n ? '' : '\n');
        return new UnixExtension(output);
}