import type { PenpalChildMethods as PenpalChildMethodsType } from '@mino/web-preload/src/api';

// Preload methods should be treated as promises
export type PromisifiedPenpalChildMethods = {
    [K in keyof PenpalChildMethods]: (
        ...args: Parameters<PenpalChildMethods[K]>
    ) => Promise<ReturnType<PenpalChildMethods[K]>>;
};

export type PenpalChildMethods = PenpalChildMethodsType;

export const PENPAL_CHILD_CHANNEL = 'PENPAL_CHILD';
