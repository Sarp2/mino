import mime from 'mime-lite';

export const MEDIA_EXTENSIONS = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/ico',
    'image/x-icon',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo',
];

export const getMimeType = (fileName: string): string => {
    const lowerCasedFileName = fileName.toLowerCase();

    // Image formats
    if (lowerCasedFileName.endsWith('.ico')) return 'image/x-icon';
    if (lowerCasedFileName.endsWith('.png')) return 'image/png';
    if (
        lowerCasedFileName.endsWith('.jpg') ||
        lowerCasedFileName.endsWith('.jpeg')
    )
        return 'image/jpeg';
    if (lowerCasedFileName.endsWith('.svg')) return 'image/svg+xml';
    if (lowerCasedFileName.endsWith('.gif')) return 'image/gif';
    if (lowerCasedFileName.endsWith('.webp')) return 'image/webp';
    if (lowerCasedFileName.endsWith('.bmp')) return 'image/bmp';

    // Video formats
    if (lowerCasedFileName.endsWith('.mp4')) return 'video/mp4';
    if (lowerCasedFileName.endsWith('.webm')) return 'video/webm';
    if (
        lowerCasedFileName.endsWith('.ogg') ||
        lowerCasedFileName.endsWith('.ogv')
    )
        return 'video/ogg';
    if (lowerCasedFileName.endsWith('.mov')) return 'video/quicktime';
    if (lowerCasedFileName.endsWith('.avi')) return 'video/x-msvideo';

    const res = mime.getType(fileName);
    if (res) return res;
    return 'application/octet-stream';
};

export const isMediaFile = (fileName: string): boolean => {
    const mimeType = getMimeType(fileName);
    return MEDIA_EXTENSIONS.includes(mimeType);
};

export const convertToBase64 = (content: Uint8Array): string => {
    return btoa(
        Array.from(content)
            .map((byte: number) => String.fromCharCode(byte))
            .join(''),
    );
};
