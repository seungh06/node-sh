import * as stream   from 'fs'
import * as os       from 'os'
import * as defined  from 'internal/definition'
import      register from 'internal/register'
import      ShxError from 'internal/shx-error'

export let previous_pwd: string | undefined;

export const cd: defined.shx<void> = (main, ...args) => {
        const { inputs } = register([ /* EMPTY OPTIONS */ ], main, args);
        let destination = inputs[0];

        console.log(destination)

        switch(destination) {
                case '~':
                case '':
                        destination = os.homedir();
                        break;

                case '-':
                        if(!previous_pwd) {
                                throw new ShxError('cannot find previous directory.');
                        }
                        destination = previous_pwd;
                        break;
        }

        try {
                previous_pwd = process.cwd();
                process.chdir(destination);
        } catch {
                if(!stream.existsSync(destination)) {
                        throw new ShxError(
                                `no such file or directory: ${destination}.`, 'node-sh',
                                'Please enter an existing path.'
                        );
                } 
                
                if(!stream.statSync(destination).isDirectory()) {
                        throw new ShxError(
                                `${destination} is not a directory.`, 'node-sh',
                                'Please enter a directory path, not a file.'
                        )
                }
        }
}