import type { UserCanvas } from '../schema';

export const createDefaultUserCanvas = (
    userId: string,
    canvasId: string,
    overrides: Partial<Omit<UserCanvas, 'userId' | 'canvasId'>> = {},
): UserCanvas => {
    return {
        ...overrides,
        userId,
        canvasId,
        scale: '0.7',
        x: '175',
        y: '100',
    };
};
