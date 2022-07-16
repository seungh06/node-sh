import * as defined from 'internal/defined';
export declare const ls_options: defined.binary_options;
export declare const ls: defined.asm<string[]>;
export declare const permissions: string[];
export declare function get_permission(mode: number): string;
export declare function format_date(date: Date): string;
export declare const pad_digits: (num: number) => string;
export declare const get_month: (month: number) => string;
export declare function get_struct(main: string, all: boolean, recursive: boolean): string[];
