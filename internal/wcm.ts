import stream from 'fs'
import path from 'path/posix'

export function generate(glob: string) {
        const symbols = [ '/', '$', '^', '+', '.', '(', ')', '=', '!', '|' ];
        let generated: string = '', group: boolean = false;

        glob.split('').forEach(function generator(character, index, origin) {
                if(symbols.includes(character)) {
                        generated += `\\${character}`;
                        return;
                }

                switch(character) {
                        case '?':
                                generated += '.';
                                break;;

                        case '{':
                                group = true;
                                generated += '(';
                                break;

                        case '}':
                                group = false;
                                generated += ')';
                                break;

                        case ',':
                                generated += group ? '|' : `\\${character}`;
                                break;
                                
                        case '*':
                                generated += '([^\/]*)';
                                break;

                        default: 
                                generated += character;
                }
        })
        return generated;
} 

export function get_struct(root: string) {
        const res: Array<string> = [ ];

        const dirents = stream.readdirSync(root, { withFileTypes: true });
        for(const dirent of dirents) {
                if(dirent.name === 'node_modules') continue; // ignore node_modules
                const basename = path.join(root, dirent.name);

                if(dirent.isDirectory()) res.push(basename, ...get_struct(basename))
                else res.push(basename);
        }
        return res;
}

export default function wcm(glob: string, flag: string = '') {
        const regex = new RegExp(`^${generate(glob)}$`, flag);
        const res = get_struct('.').filter(input => regex.test(input));

        return res.length > 0 ? res : [ glob ];
}