import ShxError from 'internal/shx-error';

export default function register(options: Array<string | boolean>[],main: TemplateStringsArray, args: any[]) {
        const cli = args.reduce(
                function reducer(previous, current, index) {
                        const input = Array.isArray(current) ? current.join(' ') : current;
                        return previous + input + main[index + 1];
                },
                main[0]
        )

        const supports = options.map(
                function mapper(option) {
                        const long = option[1] === '-' ? '' : `, --${option[1]}`;
                        return `-${options[0]}` + long;
                }
        )

        let sync_options: Array<string | boolean> | undefined, combined_input: string | undefined;
        const _options: Record<string, any> = { }, _inputs: Array<string> = [ ];

        for(const segment of divide(cli)) {
                if(segment[0] === '-') {
                        const inputs = segment[0] + segment[1] === '--'
                                ? divide(segment, '--') : segment.slice(1).split('');

                        for(const input of inputs) {
                                const found = options.find(
                                        option => option[0] === input || option[1] === input
                                );

                                if(found === undefined) {
                                        throw new ShxError(
                                                `${input} option is not recognized.`, 'node-sh', 
                                                `Supported options: ${supports}`, 1
                                        );
                                }

                                found[2] ? sync_options = found : _options[ find_valid(found) ] = true;
                        }
                } else if(sync_options) {
                        _options[ find_valid(sync_options) ] = segment, sync_options = undefined; 
                } else {
                        if(segment.startsWith('"') && !combined_input) {

                                if(segment.endsWith('"')) {
                                        _inputs.push(segment.slice(1, -1));
                                } else  combined_input = segment.slice(1);

                        } else if(segment.endsWith('"') && combined_input) {

                                combined_input += ' ' + segment.slice(0, -1);

                                _inputs.push(combined_input);
                                combined_input = undefined;

                        } else if(combined_input) {
                                combined_input += ' ' + segment;
                        } else {
                                _inputs.push(segment);
                        }
                        
                }
        }

        return { options: _options, inputs: _inputs }
}

export const divide = (input: string, sep: string = ' ') => {
        return input.split(sep).filter(input => input.length > 0);
}

export const find_valid = (input: Array<string | boolean>) => {
        return (input[1] === '' ? input[0] : input[1]) as string;
} 