import * as defined from 'internal/defined';
declare class _UnixExtension<T> {
    readonly stdout: T;
    constructor(stdout: T);
    grep: defined.asm<string[]>;
    head: defined.asm<string>;
    tail: defined.asm<string>;
    uniq: defined.asm<string>;
    sort: defined.asm<string>;
    private get_stdout;
}
export declare function get_prototypes<T>(object: T): Record<string, any>;
export declare type UnixExtension<T> = _UnixExtension<T> & T;
export declare const UnixExtension: new <T>(stdout: T) => UnixExtension<T>;
export {};
