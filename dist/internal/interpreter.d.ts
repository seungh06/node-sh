import * as defined from 'internal/defined';
export declare function interpret(token: defined.binary_options, main: TemplateStringsArray, args: Array<any>): {
    options: Record<string, any>;
    stdin: string[];
};
export declare const division: (main: string, separator?: string) => string[];
export declare function compose(object: Array<string>, index: number): string;
export declare const get_head: (option: defined.binary_option) => string;
export declare function generate_man(token: defined.binary_options): string;
