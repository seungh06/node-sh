import { UnixExtension } from 'internal/extension';
export declare type asm<stdout> = (main: TemplateStringsArray, ...args: any[]) => stdout extends void ? void : UnixExtension<stdout>;
export declare type binary_option = Partial<{
    short: string | string[];
    long: string | string[];
    input: string;
    description: string;
}>;
export declare type binary_options = binary_option[];
