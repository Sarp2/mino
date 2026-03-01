import type { UserCanvas } from '../schema';

export const createDefaultUserCanvas = (
    userId: string,
    canvasId: string,
    overrides: Partial<UserCanvas>,
): UserCanvas => {
    return {
        userId,
        canvasId,
        scale: '0.7',
        x: '175',
        y: '100',
        ...overrides,
    };
};
