/// <reference types="node" />
import * as defined from 'internal/defined';
import fs from 'node:fs';
export declare const touch_options: defined.binary_options;
export declare const touch: defined.asm<void>;
export declare const try_stat: (main: string) => fs.Stats | null;
