export declare const node: Record<string, any>;
export declare const modules: Record<string, string>;
export declare function access_module(): void;
export declare const header: (path: string) => string;
declare global {
    var $: defined.asm<string> & {
        env: {
            verbose: boolean;
            prefix: string;
            shell: string | boolean;
            max_buffer: number;
        };
        cat: defined.asm<string>;
        head: defined.asm<string>;
        tail: defined.asm<string>;
        ls: defined.asm<string[]>;
        cd: defined.asm<void>;
        pwd: defined.asm<string>;
        mkdir: defined.asm<void>;
        rm: defined.asm<void>;
        rmdir: defined.asm<void>;
        touch: defined.asm<void>;
        grep: defined.asm<string[]>;
        chmod: defined.asm<void>;
        dirs: defined.asm<string[]>;
        pushd: defined.asm<string[]>;
        popd: defined.asm<void>;
        which: defined.asm<string>;
        echo: defined.asm<string>;
        mv: defined.asm<void>;
        uniq: defined.asm<string>;
        sort: defined.asm<string>;
        whoami: defined.asm<string>;
        cp: defined.asm<void>;
    };
}
export declare function load_binary(): void;
export declare const basename: (input: string) => string;
declare const _default: defined.asm<string> & {
    env: {
        verbose: boolean;
        prefix: string;
        shell: string | boolean;
        max_buffer: number;
    };
    cat: defined.asm<string>;
    head: defined.asm<string>;
    tail: defined.asm<string>;
    ls: defined.asm<string[]>;
    cd: defined.asm<void>;
    pwd: defined.asm<string>;
    mkdir: defined.asm<void>;
    rm: defined.asm<void>;
    rmdir: defined.asm<void>;
    touch: defined.asm<void>;
    grep: defined.asm<string[]>;
    chmod: defined.asm<void>;
    dirs: defined.asm<string[]>;
    pushd: defined.asm<string[]>;
    popd: defined.asm<void>;
    which: defined.asm<string>;
    echo: defined.asm<string>;
    mv: defined.asm<void>;
    uniq: defined.asm<string>;
    sort: defined.asm<string>;
    whoami: defined.asm<string>;
    cp: defined.asm<void>;
};
export default _default;

declare namespace defined {
	export type asm<stdout> = (main: TemplateStringsArray, ...args: any[]) => stdout extends void ? void : UnixExtension<stdout>;
	export type binary_option = Partial<{
	    short: string | string[];
	    long: string | string[];
	    input: string;
	    description: string;
	}>;
	export type binary_options = binary_option[];
	
}
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
