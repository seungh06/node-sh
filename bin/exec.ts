import { spawnSync } from 'node:child_process'
import { UnixExtension } from 'internal/extension'
import { InternalError } from 'internal/exception'

export default function $(main: TemplateStringsArray, ...args: Array<any>) {
        const cli = args.reduce<string>(
                function reducer(previous, current, index) {
                        const input = Array.isArray(current) ? current.join(' ') : current;
                        return previous + input + main[index + 1];
                },
                main[0]
        )

        const subprocess = spawnSync(
                $.env.prefix + cli,
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