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
import { groupElements, ungroupElements } from './elements/dom/group';
import {
    getActionElement,
    getActionLocation,
    getElementType,
    getFirstMinoElement,
    setElementType,
} from './elements/dom/helpers';
import { insertImage, removeImage } from './elements/dom/image';
import {
    getInsertLocation,
    insertElement,
    removeElement,
} from './elements/dom/insert';
import { getRemoveAction } from './elements/dom/remove';
import { getElementIndex, moveElement } from './elements/move';
import {
    drag,
    dragAbsolute,
    endAllDrag,
    endDrag,
    endDragAbsolute,
    startDrag,
} from './elements/move/drag';
import { getComputedStyleByDomId } from './elements/style';
import {
    editText,
    isChildTextEditable,
    startEditingText,
    stopEditingText,
} from './elements/text';
import { handleBodyReady } from './ready';
import { setBranchId, setFrameId } from './state';
import { updateStyle } from './style';
import { getTheme, setTheme } from './theme';

/** Wraps any function in a try-catch block that logs errors and returns null instead of crashing. **Applied to every preload method so one failure doesn't break the entire preload script**. */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withTryCatch<T extends (...args: any[]) => any>(fn: T): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((...args: any[]) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return
            return fn(...args);
        } catch (error) {
            console.error(`Error in ${fn.name}:`, error);
            return null;
        }
    }) as T;
}

const rawMethods = {
    // Misc
    processDom,
    setFrameId,
    setBranchId,
    getComputedStyleByDomId,
    updateElementInstance,
    getFirstMinoElement,
    buildLayerTree,

    // Elements
    getElementAtLoc,
    getElementByDomId,
    getElementIndex,
    getElementType,
    setElementType,
    getParentElement,
    getChildrenCount,
    getOffset,

    // Actions
    getActionLocation,
    getActionElement,
    getInsertLocation,
    getRemoveAction,

    // Theme
    getTheme,
    setTheme,

    // Drag
    startDrag,
    drag,
    dragAbsolute,
    endDrag,
    endDragAbsolute,
    endAllDrag,

    // Edit text
    startEditingText,
    editText,
    stopEditingText,
    isChildTextEditable,

    // Edit elements
    updateStyle,
    insertElement,
    removeElement,
    moveElement,
    groupElements,
    ungroupElements,
    insertImage,
    removeImage,
    handleBodyReady,
};

/** All preload methods collected into a single object, each wrapped in withTryAndCatch. **This is what gets passed to penpal as the methods the iframe exposes to the parent**. */
export const preloadMethods = Object.fromEntries(
    Object.entries(rawMethods).map(([key, fn]) => [key, withTryCatch(fn)]),
) as typeof rawMethods;

export type PenpalChildMethods = typeof preloadMethods;
export type { ProcessDomResult };
