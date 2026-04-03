import type {
    ActionElement,
    ActionLocation,
    DomElement,
    LayerNode,
} from '@mino/models';

import { buildLayerTree } from '../../../api/dom';
import { cssManager } from '../../../api/style';
import { EditorAttributes, INLINE_ONLY_CONTAINERS } from '../../../constants';
import { assertNever, getHTMLElement } from '../../../helpers';
import { getInstanceId, getOid, getOrAssignDomId } from '../../../helpers/ids';
import { getDeepElement, getDomElement } from '../helpers';

/** Finds the child in a container whose vertical midpoint is closest to y, returns the index where a new element should be inserted (before or after that child). */
function findClosestIndex(container: HTMLElement, y: number): number {
    const children = Array.from(container.children);
    if (children.length === 0) return 0;

    let closestIndex = 0;
    let minDistance = Infinity;

    children.forEach((child, index) => {
        const rect = child.getBoundingClientRect();
        const childMiddle = rect.top + rect.height / 2;
        const distance = Math.abs(y - childMiddle);

        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
        }
    });

    const closestRect = children[closestIndex]?.getBoundingClientRect();
    if (!closestRect) return 0;

    const closestMiddle = closestRect.top + closestRect?.height / 2;
    return y > closestMiddle ? closestIndex + 1 : closestIndex;
}

/** Hit-tests (x, y) on the page, walks up to the nearest block-level container, returns an ActionLocation - type 'index' for flex/grid parents, 'append' otherwise. */
export function getInsertLocation(x: number, y: number): ActionLocation | null {
    const targetEl = findNearestBlockLevelContainer(x, y);
    if (!targetEl) return null;

    const display = window.getComputedStyle(targetEl).display;
    const isStackOrGrid = display === 'flex' || display === 'grid';

    if (isStackOrGrid) {
        const index = findClosestIndex(targetEl, y);
        return {
            type: 'index',
            targetDomId: getOrAssignDomId(targetEl),
            targetOid: getInstanceId(targetEl) ?? getOid(targetEl) ?? null,
            index,
            originalIndex: index,
        };
    }

    return {
        type: 'append',
        targetDomId: getOrAssignDomId(targetEl),
        targetOid: getInstanceId(targetEl) ?? getOid(targetEl) ?? null,
    };
}

/** Walks up from the deepest element at (x,y), skipping inline-only containers (e.g. <span>, <a>) until it finds a proper block container. */
function findNearestBlockLevelContainer(
    x: number,
    y: number,
): HTMLElement | null {
    let targetEl = getDeepElement(x, y) as HTMLElement | null;
    if (!targetEl) return null;

    let inlineOnly = true;
    while (targetEl && inlineOnly) {
        inlineOnly = INLINE_ONLY_CONTAINERS.has(targetEl.tagName.toLowerCase());
        if (inlineOnly) {
            targetEl = targetEl.parentElement;
        }
    }
    return targetEl;
}

/** Creates a real DOM element from an ActionElement descriptor and inserts it
 *  into the target at the given location (append / prepend / index).
 *  Returns the new DomElement snapshot and the updated layer tree. */
export function insertElement(
    element: ActionElement,
    location: ActionLocation,
): { domEl: DomElement; newMap: Map<string, LayerNode> | null } | undefined {
    const targetEl = getHTMLElement(location.targetDomId);
    if (!targetEl) {
        console.warn(`Target element not found: ${location.targetDomId}`);
        return;
    }

    const newEl = createElement(element);

    switch (location.type) {
        case 'append':
            targetEl.appendChild(newEl);
            break;
        case 'prepend':
            targetEl.prepend(newEl);
            break;
        case 'index':
            if (location.index === undefined || location.index < 0) {
                console.warn(`Invalid index: ${location.index}`);
                return;
            }

            if (location.index >= targetEl.children.length) {
                targetEl.appendChild(newEl);
            } else {
                targetEl.insertBefore(
                    newEl,
                    targetEl.children.item(location.index),
                );
            }
            break;
        default:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            console.warn(`Invalid position: ${location}`);
            assertNever(location);
    }

    const domEl = getDomElement(newEl, true);
    const newMap = buildLayerTree(newEl);

    return { domEl, newMap };
}

/** Recursively builds a live HTMLElement from an ActionElement — sets tag, attributes, text content, inline styles, and children. */
export function createElement(element: ActionElement) {
    const newEl = document.createElement(element.tagName);
    newEl.setAttribute(EditorAttributes.DATA_MINO_INSERTED, 'true');

    for (const [key, value] of Object.entries(element.attributes)) {
        newEl.setAttribute(key, value);
    }

    if (element.textContent !== null && element.textContent !== undefined) {
        newEl.textContent = element.textContent;
    }

    for (const [key, value] of Object.entries(element.styles)) {
        newEl.style.setProperty(cssManager.jsToCssProperty(key), value);
    }

    for (const child of element.children) {
        const childEl = createElement(child);
        newEl.appendChild(childEl);
    }

    return newEl;
}

/** Hides (display: none) the element at the given location inside the target container. Returns the hidden element's DomElement snapshot and the updated layer tree. */
export function removeElement(
    location: ActionLocation,
): { domEl: DomElement; newMap: Map<string, LayerNode> | null } | null {
    const targetEl = getHTMLElement(location.targetDomId);
    if (!targetEl) {
        console.warn(`Target element not found: ${location.targetDomId}`);
        return null;
    }

    let elementToRemove: HTMLElement | null = null;

    switch (location.type) {
        case 'append':
            elementToRemove = targetEl.lastElementChild as HTMLElement | null;
            break;
        case 'prepend':
            elementToRemove = targetEl.firstElementChild as HTMLElement | null;
            break;
        case 'index':
            if (location.index !== -1) {
                elementToRemove = targetEl.children.item(
                    location.index,
                ) as HTMLElement | null;
            } else {
                console.warn(`Invalid index: ${location.index}`);
                return null;
            }
            break;
        default:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            console.warn(`Invalid position: ${location}`);
            assertNever(location);
    }

    if (elementToRemove) {
        const domEl = getDomElement(elementToRemove, true);
        elementToRemove.style.display = 'none';
        const newMap = targetEl.parentElement
            ? buildLayerTree(targetEl.parentElement)
            : null;

        return { domEl, newMap };
    } else {
        console.warn(`No element found to remove at the specified location`);
        return null;
    }
}
