export const isWindows = process.platform === 'win32' 
        || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';

export type shx<T> = (main: TemplateStringsArray, ...args: any[]) => T;
export type unit<T> = () => T;