import { spawnSync as spawn } from 'child_process'
import ShxError from 'internal/shx-error';

export default function $(main: TemplateStringsArray, ...args: any[]) {
        const cli = args.reduce(
                function reducer(previous, current, index) {
                        const input = Array.isArray(current) ? current.join(' ') : current;
                        return previous + input + main[index + 1];
                },
                main[0]
        )

        const subprocess = spawn(
                $.env.prefix + cli,
                {
                        encoding   : 'utf-8',
                        cwd        : process.cwd(),
                        shell      : $.env.shell,
                        maxBuffer  : $.env.max_buffer,
                        windowsHide: true,
                }
        )

        if(subprocess.status !== 0) {
                throw new ShxError(`${subprocess.stderr} \nexit code: ${subprocess.status}`);
        }

        return subprocess.stdout;
}

$.env = {
        verbose    : false,
        prefix     : '',
        shell      : true,
        max_buffer : 200 * 1024 * 1024
}