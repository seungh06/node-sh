import * as defined from 'core/defined'
import { UnixExtension } from 'core/extension'
import path from 'path'

export const pwd: defined.sh<string> = (main, ...args) => {
        const output = path.resolve(process.cwd());
        return new UnixExtension(output);
}