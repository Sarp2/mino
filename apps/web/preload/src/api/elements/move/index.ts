import type { DomElement, LayerNode } from '@mino/models';

import { buildLayerTree } from '../../../api/dom';
import { getHTMLElement, isValidHTMLElement } from '../../../helpers';
import { getDomElement } from '../helpers';

/** Moves the element to newIndex within its parent, then returns the updated DomElement and rebuild layer tree of the parent */
export function moveElement(
    domId: string,
    newIndex: number,
): { domEl: DomElement; newMap: Map<string, LayerNode> | null } | null {
    const el = getHTMLElement(domId);
    if (!el) {
        console.warn(`Move element not found: ${domId}`);
        return null;
    }

    const movedEl = moveElToIndex(el, newIndex);
    if (!movedEl) {
        console.warn(`Failed to move element: ${domId}`);
        return null;
    }

    const domEl = getDomElement(movedEl, true);
    const newMap = movedEl.parentElement
        ? buildLayerTree(movedEl.parentElement)
        : null;

    return {
        domEl,
        newMap,
    };
}

/** Returns the element's current index among its parent's valid HTML children, or -1 if not found. */
export function getElementIndex(domId: string): number {
    const el = getHTMLElement(domId);
    if (!el) {
        console.warn(`element not found: ${domId}`);
        return -1;
    }

    const htmlElements = Array.from(el.parentElement?.children ?? []).filter(
        isValidHTMLElement,
    );

    const index = htmlElements.indexOf(el);
    return index;
}

/** Removes the element from its parent and reinserts it at newIndex among valid HTML children. Appends to end if newIndex exceeds children length */
export function moveElToIndex(
    el: HTMLElement,
    newIndex: number,
): HTMLElement | undefined {
    const parent = el.parentElement;
    if (!parent) {
        console.warn('Parent not found');
        return;
    }

    const children = Array.from(parent.children).filter(
        (child): child is HTMLElement =>
            child !== el && isValidHTMLElement(child),
    );

    const clampedIndex = Math.max(0, Math.min(newIndex, children.length));
    parent.removeChild(el);

    const referencedNode = children[clampedIndex];
    if (!referencedNode) {
        parent.appendChild(el);
        return el;
    }

    parent.insertBefore(el, referencedNode);
    return el;
}
