import * as defined from 'internal/defined'
import { UnixExtension } from 'internal/extension'
import path from 'path'

export const pwd: defined.sh<string> = (main, ...args) => {
        const output = path.resolve(process.cwd());
        return new UnixExtension(output);
}