import path from 'node:path';

/**
 * Normalizes a path by removing empty segments and double slashes
 */

export const normalizePath = (input: string) => {
    const normalized = path.posix.normalize(input.replace(/\\/g, '/'));
    const relative = normalized.replace(/^\/+/, '');

    if (relative === '..' || relative.startsWith('../')) {
        throw new Error('Path traversal is not allowed');
    }

    return relative.split('/').filter(Boolean).join('/');
};
