import type { WebSocketSession } from '@codesandbox/sdk';

import { type SandboxFile } from '@mino/models';
import { isMediaFile } from '@mino/utility';

export const getFileFromContent = (
    filePath: string,
    content: string | Uint8Array,
) => {
    const type = content instanceof Uint8Array ? 'binary' : 'text';
    const newFile: SandboxFile =
        type === 'binary'
            ? { type, path: filePath, content: content as Uint8Array }
            : { type, path: filePath, content: content as string };
    return newFile;
};

export const readRemoteFile = async (
    client: WebSocketSession,
    filePath: string,
): Promise<SandboxFile | null> => {
    try {
        if (isMediaFile(filePath)) {
            const content = await client.fs.readFile(filePath);
            return getFileFromContent(filePath, content);
        } else {
            const content = await client.fs.readTextFile(filePath);
            return getFileFromContent(filePath, content);
        }
    } catch (error) {
        console.error(`Error reading remote file ${filePath}:`, error);
        return null;
    }
};
