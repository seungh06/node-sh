import stream from 'fs'
import path from 'path'

export const constants = {
        RESET: '\x1b[0m', NEW_LINE: '\n', TAB: '\t',
        BG_RED: '\x1b[41m', FG_WHITE: '\x1b[97m', FG_GRAY: '\x1b[90m'
}

export class InternalError extends Error {
        constructor(message: string, suggest: string = '', depth: number = 0, node: Array<string> = [ ]) {
                super(message);

                const { func, storage, line }= this.load_traces(depth);
                const node_string = node.length ? node.join(': ') + ': ' : ''; 

                this.stack = [ 
                        this.get_header(storage, line), this.render(storage, parseInt(line)), this.get_body(node_string, suggest)
                ].join(constants.NEW_LINE + constants.TAB);
        }

        private load_traces(depth: number) {
                const stacks = this.stack!!.split(/^\s*at\s/m)[depth + 2].trim()
                        .split(/(?:(.+?)\s+\()?(?:(.+?):(\d+):(\d+)\))/);

                return { func: stacks[1], storage: stacks[2], line: stacks[3] }
        }

        private render_code(storage: string, line: number) {
                const content = stream.readFileSync(storage, 'utf-8').replace(/\r/g, '').split('\n');

                const code = content.map(
                        function mapper(input, index) {
                                const num_color = index + 1 === line ? constants.BG_RED + constants.FG_WHITE : constants.FG_GRAY;
                                return `${ num_color }${ (`     ${index + 1}`).slice(-6) }: ${ constants.FG_WHITE }${input}`
                        }
                ).filter((_, index) => index < line + 4 && index > line -5);

                const max_spaces = code.reduce(
                        function reducer(max, value) {
                                return max.length < value.length ? value : max;
                        }
                ).length;

                return code.map(content => content + ' '.repeat(max_spaces - content.length) + constants.RESET).join(constants.NEW_LINE + constants.TAB);
        }

        get_header(storage: string, line: string) {
                return [
                        constants.NEW_LINE.repeat(2) + constants.TAB + constants.FG_WHITE + 'node-sh',
                        constants.FG_GRAY  + path.basename(storage) + ':' + line + constants.NEW_LINE
                ].join(constants.NEW_LINE + constants.TAB);
        }

        render(storage: string, line: number) {
                return this.render_code(storage, line) + constants.NEW_LINE;
        }

        get_body(node: string, suggest: string) {
                return [
                        constants.FG_WHITE + '• ' + node + this.message.replaceAll(constants.NEW_LINE, constants.NEW_LINE + constants.TAB) + constants.RESET,
                        suggest.replaceAll(constants.NEW_LINE, constants.NEW_LINE + constants.TAB) + constants.NEW_LINE
                ].join(constants.NEW_LINE + constants.TAB);
        }
}