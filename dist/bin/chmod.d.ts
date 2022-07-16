import * as defined from 'internal/defined';
export declare const chmod_options: defined.binary_options;
export declare const chmod: defined.asm<void>;
export declare const constants: {
    EXEC: number;
    WRITE: number;
    READ: number;
    S_ISUID: number;
    S_ISGID: number;
    S_ISVTX: number;
};
export declare function load_reference(target: string): number;
export declare const to_int: (input: string) => string | number;
export declare function get_struct(main: string): string[];
export declare const permissions: string[];
export declare function get_permission(mode: number): string;
export declare function process_symbol(symbol: Array<string>): {
    target: {
        user: boolean;
        group: boolean;
        other: boolean;
    };
    operator: string;
    symbol: {
        read: boolean;
        write: boolean;
        execute: boolean;
        exec_dir: boolean;
        sticky: boolean;
        setuid: boolean;
    };
};
