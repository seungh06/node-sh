import * as defined from 'core/defined'
import { UnixExtension } from 'core/extension'
import { interpret } from 'core/interpreter'

export const echo_options: defined.sh_options = [
        {
                short: 'n', 
                description: 'do not output the trailing newline'
        },
        
        {
                short: 'e',
                description: 'enable interpretation of backslash escapes'
        }
]

export const echo: defined.sh<string> = (main, ...args) => {
        const { options, stdin } = interpret(echo_options, main, args);
        
        const output = stdin.join(' ') + (options.n ? '' : '\n');
        return new UnixExtension(output);
}