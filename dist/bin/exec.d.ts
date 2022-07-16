import { UnixExtension } from 'internal/extension';
declare function $(main: TemplateStringsArray, ...args: Array<any>): UnixExtension<string>;
declare namespace $ {
    var env: {
        verbose: boolean;
        prefix: string;
        shell: boolean;
        max_buffer: number;
    };
}
export default $;
