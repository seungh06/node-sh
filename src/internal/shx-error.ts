import * as path   from 'path'
import * as stream from 'fs'

export const ESC = {
    NEW_LINE: '\n',       TAB:      '\t',       RESET: '\x1b[0m',  
    BG_RED:   '\x1b[41m', FG_WHITE: '\x1b[97m', FG_GRAY: '\x1b[90m'
}


export default class ShxError extends Error {
        constructor(message: string, name: string = 'node-sh', suggest?: string, depth: number = 0) {
                super(message);

                const stack = this.stack?.replace(message, '').split(ESC.NEW_LINE)[2 + depth].match(
                        /at (?:(.+?)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/
                );

                if(!stack) return;

                const [ ,, script, line ] = stack;
                const code = this.render(script, parseInt(line));
                const cleared = message.replace(/\r/g, '').replace(/\n/g, '\n\t  ');

                this.stack = [ 
                        ESC.NEW_LINE.repeat(2)   + ESC.TAB               + ESC.FG_WHITE + name,
                        ESC.FG_GRAY              + path.basename(script) + ':'          + line       + ESC.NEW_LINE,
                        code                     + ESC.NEW_LINE,
                        ESC.FG_WHITE             + '• '                  + cleared      + ESC.RESET,
                        (suggest ? suggest : '') + ESC.NEW_LINE
                ].join(ESC.NEW_LINE + ESC.TAB);
        }

        private render(target: string, line: number) {
                const content = stream.readFileSync(target, 'utf-8')
                        .replace(/\r/g, '').split(ESC.NEW_LINE);

                const format = content
                        .map((input, index) => `${
                                index + 1 === line ? ESC.BG_RED + ESC.FG_WHITE : ESC.FG_GRAY
                        } ${ index + 1 }: ${ESC.FG_WHITE}${input}`)
                        .filter((_, index) => index < line + 4 && index > line - 5);

                const max_spaces = format
                        .reduce((max, value) => max = max.length < value.length ? value : max).length;

                return format.map(content => content + ' '.repeat(max_spaces - content.length) + ESC.RESET)
                        .join(ESC.NEW_LINE + ESC.TAB);
        }
}