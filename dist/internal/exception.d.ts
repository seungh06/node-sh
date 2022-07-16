export declare const constants: {
    RESET: string;
    NEW_LINE: string;
    TAB: string;
    BG_RED: string;
    FG_WHITE: string;
    FG_GRAY: string;
};
export declare class InternalError extends Error {
    constructor(message: string, suggest?: string, depth?: number, node?: Array<string>);
    private load_traces;
    private render_code;
    get_header(storage: string, line: string): string;
    render(storage: string, line: number): string;
    get_body(node: string, suggest: string): string;
}
