import { UnixExtension } from 'internal/extension'

export type sh<stdout> = (main: TemplateStringsArray, ...args: any[]) =>
        stdout extends void ? void : UnixExtension<stdout>

export type sh_option = {
        short?: string | string[], long?: string | string[], input?: string, description?: string   
}

export type sh_options = sh_option[]