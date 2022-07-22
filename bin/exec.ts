import { spawnSync } from 'node:child_process'
import { UnixExtension } from 'internal/extension'
import { InternalError } from 'internal/exception'
import { interpret } from 'internal/interpreter'

export default function $(main: TemplateStringsArray, ...args: Array<any>) {
        const { stdin } = interpret([ /* EMPTY OPTIONS */ ], main, args);
        
        const subprocess = spawnSync(
                $.env.prefix + stdin.join(' '),
                {
                        encoding   : 'utf-8',
                        cwd        : process.cwd(),
                        shell      : $.env.shell || true,
                        maxBuffer  : $.env.max_buffer,
                        windowsHide: true,
                }
        )

        if(subprocess.status !== 0) {
                throw new InternalError(`${subprocess.stderr} \nexit code: ${subprocess.status}`);
        }

        return new UnixExtension(subprocess.stdout);
}

$.env = {
        verbose    : false,
        prefix     : '',
        shell      : true,
        max_buffer : 200 * 1024 * 1024
}