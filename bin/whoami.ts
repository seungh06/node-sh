import * as defined from 'internal/defined'
import { UnixExtension } from 'internal/extension'
import os from 'node:os'

export const whoami: defined.asm<string> = (main, ...args) => {
        const user = os.userInfo().username;
        return new UnixExtension(user);
}