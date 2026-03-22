import type { WriteFileInput, WriteFileOutput } from '../../../types';
import type { WebSocketSession } from '@codesandbox/sdk';

import { normalizePath } from '@mino/utility';

export const writeFile = async (
    client: WebSocketSession,
    { args }: WriteFileInput,
): Promise<WriteFileOutput> => {
    const normalizedPath = normalizePath(args.path);
    try {
        if (typeof args.content === 'string') {
            await client.fs.writeTextFile(normalizedPath, args.content);
        } else if (args.content instanceof Uint8Array) {
            await client.fs.writeFile(normalizedPath, args.content);
        } else {
            throw new Error(`Invalid content type ${typeof args.content}`);
        }
        return { success: true };
    } catch (error) {
        console.error(`Error writing remote file ${normalizedPath}:`, error);
        return { success: false };
    }
};
