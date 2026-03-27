import type { ProcessDomResult } from './dom';

import { buildLayerTree, processDom } from './dom';
import {
    getChildrenCount,
    getElementAtLoc,
    getElementByDomId,
    getOffset,
    getParentElement,
    updateElementInstance,
} from './elements';
import { getComputedStyleByDomId } from './elements/style';

/** Wraps any function in a try-catch block that logs errors and returns null instead of crashing. **Applied to every preload method so one failure doesn't break the entire preload script**. */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withTryCatch<T extends (...args: any[]) => any>(fn: T): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((...args: any[]) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return
            return fn(...args);
        } catch (error) {
            console.log(`Error in ${fn.name}:`, error);
            return null;
        }
    }) as T;
}

const rawMethods = {
    processDom,
    getElementAtLoc,
    getElementByDomId,
    getParentElement,
    getChildrenCount,
    getOffset,
    updateElementInstance,
    getComputedStyleByDomId,
    buildLayerTree,
};

/** All preload methods collected into a single object, each wrapped in withTryAndCatch. **This is what gets passed to penpal as the methods the iframe exposes to the parent**. */
export const preloadMethods = Object.fromEntries(
    Object.entries(rawMethods).map(([key, fn]) => [key, withTryCatch(fn)]),
) as typeof rawMethods;

export type PenpalChildMethods = typeof preloadMethods;
export type { ProcessDomResult };
