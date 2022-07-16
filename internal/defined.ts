import { UnixExtension } from 'internal/extension'

export type asm<stdout> = (main: TemplateStringsArray, ...args: any[]) =>
        stdout extends void ? void : UnixExtension<stdout>


export type binary_option = Partial<{
        short: string | string[], long: string | string[], input: string, description: string
}>

export type binary_options = binary_option[];