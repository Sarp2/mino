import type { DomElement, ElementPosition } from '@mino/models';

import { EditorAttributes } from '../../../constants';
import { getHTMLElement, isValidHTMLElement } from '../../../helpers';
import { getOrAssignDomId } from '../../../helpers/ids';
import { getDomElement, restoreElementStyle } from '../helpers';
import { getDisplayDirection } from './helpers';
import { createStub, getCurrentStubIndex, moveStub, removeStub } from './stub';

/** Saves the element's current styles, creates a stub placeholder, sets position to fixed, and returns the original index in the parent. */
export function startDrag(domId: string): number | null {
    const el = getHTMLElement(domId);
    if (!el) {
        console.warn(`Start drag element not found: ${domId}`);
        return null;
    }

    const parent = el.parentElement;
    if (!parent) {
        console.warn('Start drag parent not found');
        return null;
    }

    const htmlChildren = Array.from(parent.children).filter(isValidHTMLElement);
    const orignalIndex = htmlChildren.indexOf(el);
    const styles = window.getComputedStyle(el);

    prepareElementForDragging(el);

    if (styles.position !== 'absolute') {
        createStub(el);
    }

    const pos = getAbsolutePosition(el);
    const rect = el.getBoundingClientRect();

    const offset =
        styles.position === 'absolute'
            ? {
                  x: pos.left,
                  y: pos.top,
              }
            : {
                  x: pos.left - rect.left,
                  y: pos.top - rect.top,
              };

    el.setAttribute(
        EditorAttributes.DATA_MINO_DRAG_START_POSITION,
        JSON.stringify({ ...pos, offset }),
    );

    return orignalIndex;
}

/** Moves an absolutely positioned element by updating left/top relative to its parent, using the drag start position as origin. */
export function dragAbsolute(
    domId: string,
    x: number,
    y: number,
    origin: ElementPosition,
) {
    const el = getHTMLElement(domId);
    if (!el) {
        console.warn('Dragging element not found');
        return;
    }

    const parent = el.parentElement;
    if (parent) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const pos = JSON.parse(
            el.getAttribute(EditorAttributes.DATA_MINO_DRAG_START_POSITION) ??
                '{}',
        );

        const parentRect = parent.getBoundingClientRect();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const newLeft = x - parentRect.left - (origin.x - pos.offset.x);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const newTop = x - parentRect.top - (origin.y - pos.offset.y);

        el.style.left = `${newLeft}px`;
        el.style.top = `${newTop}px`;
    }
    el.style.transform = 'none';
}

/** Translates the element with a CSS transform and moves the stub placeholder to the closest insertion point under the cursor. */
export function drag(
    domId: string,
    dx: number,
    dy: number,
    x: number,
    y: number,
) {
    const el = getHTMLElement(domId);
    if (!el) {
        console.warn('Dragging element not found');
        return;
    }

    if (!el.style.transition) {
        el.style.transition = 'transform 0.05s cubic-bezier(0.2, 0, 0, 1)';
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const pos = JSON.parse(
        el.getAttribute(EditorAttributes.DATA_MINO_DRAG_START_POSITION) ?? '{}',
    );

    if (el.style.position !== 'fixed') {
        const styles = window.getComputedStyle(el);
        el.style.position = 'fixed';
        el.style.width = styles.width;
        el.style.height = styles.height;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        el.style.left = `${pos.left}`;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        el.style.top = `${pos.top}`;
    }

    el.style.transform = `translate(${dx}px, ${dy}px)`;

    const parent = el.parentElement;
    if (parent) {
        moveStub(el, x, y);
    }
}

/** Cleans up drag attributes and returns the final left/top values for an absolutely positioned drag. */
export function endDragAbsolute(
    domId: string,
): { left: string; top: string } | null {
    const el = getHTMLElement(domId);
    if (!el) {
        console.warn('End drag element not found');
        return null;
    }

    const styles = window.getComputedStyle(el);
    removeDragAttributes(el);
    getOrAssignDomId(el);

    return {
        left: styles.left,
        top: styles.top,
    };
}

/** Cleans up drag state and returns the stub's final index, child, and parent so the editor can commit the new position. Returns null if the index didn't change. */
export function endDrag(
    domId: string,
): { newIndex: number; child: DomElement; parent: DomElement } | null {
    const el = getHTMLElement(domId);
    if (!el) {
        console.warn('End darg element not found');
        endAllDrag();
        return null;
    }

    const parent = el.parentElement;
    if (!parent) {
        console.warn('End drag parent not found');
        cleanUpElementAfterDragging(el);
        return null;
    }

    const stubIndex = getCurrentStubIndex(parent, el);
    cleanUpElementAfterDragging(el);
    removeStub();

    if (stubIndex === -1) {
        return null;
    }

    const elementIndex = Array.from(parent.children).indexOf(el);
    if (stubIndex === elementIndex) return null;

    return {
        newIndex: stubIndex,
        child: getDomElement(el, false),
        parent: getDomElement(parent, false),
    };
}

/** Saves all relevant style properties before dragging so they can be restored on endDrag. No-ops if already saved. */
function prepareElementForDragging(el: HTMLElement) {
    const saved = el.getAttribute(EditorAttributes.DATA_MINO_DRAG_SAVED_STYLE);
    if (!saved) return;

    // Save all relevant style properties for later restoration
    const style = {
        position: el.style.position,
        transform: el.style.transform,
        width: el.style.width,
        height: el.style.height,
        left: el.style.left,
        top: el.style.top,
    };

    el.setAttribute(
        EditorAttributes.DATA_MINO_DRAG_SAVED_STYLE,
        JSON.stringify(style),
    );
    el.setAttribute(EditorAttributes.DATA_MINO_DRAGGING, 'true');

    // Ensure element appears above others during drag
    el.style.zIndex = '1000';

    if (el.getAttribute(EditorAttributes.DATA_MINO_DRAG_DIRECTION) !== null) {
        const parent = el.parentElement;
        if (parent) {
            const displayDirection = getDisplayDirection(parent);
            el.setAttribute(
                EditorAttributes.DATA_MINO_DRAG_DIRECTION,
                displayDirection,
            );
        }
    }
}

/** Restores saved styles and removes all drag-related attributes. */
function cleanUpElementAfterDragging(el: HTMLElement) {
    restoreElementStyle(el);
    removeDragAttributes(el);
    getOrAssignDomId(el);
}

/** Removes all DATA_MINO_DRAG* attributes from the element. */
export function removeDragAttributes(el: HTMLElement) {
    el.removeAttribute(EditorAttributes.DATA_MINO_DRAG_SAVED_STYLE);
    el.removeAttribute(EditorAttributes.DATA_MINO_DRAGGING);
    el.removeAttribute(EditorAttributes.DATA_MINO_DRAG_DIRECTION);
    el.removeAttribute(EditorAttributes.DATA_MINO_DRAG_START_POSITION);
}

/** Returns the element's absolute position including scroll offset. */
function getAbsolutePosition(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
    };
}

/** Cleans up all currently dragging elements and removes the stub. Used as a safety net when drag ends unexpectedly. */
export function endAllDrag() {
    const draggingElements = document.querySelectorAll(
        `[${EditorAttributes.DATA_MINO_DRAGGING}]`,
    );

    for (const el of Array.from(draggingElements)) {
        cleanUpElementAfterDragging(el as HTMLElement);
    }

    removeStub();
}
