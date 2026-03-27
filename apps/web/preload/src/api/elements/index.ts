import type { DomElement } from '@mino/models';

import { EditorAttributes } from '../../constants';
import { getHTMLElement } from '../../helpers';
import { getDomElement } from './helpers';

/** Looks up an element by its dom id and returns it as a **DomElement** object. */
export function getElementByDomId(
    domId: string,
    getStyle: boolean,
): DomElement {
    const el = getHTMLElement(domId) ?? document.body;
    return getDomElement(el, getStyle);
}

/** Finds the deepest element at (x, y) screen coordinates and returns it as a **DomElement**. This is what the editor calls on every mouse move/click to know what the user is pointing at. Falls back to document.body. */
export function getElementAtLoc(
    x: number,
    y: number,
    getStyle: boolean,
): DomElement {
    const el = getDeepElement(x, y) ?? document.body;
    return getDomElement(el as HTMLElement, getStyle);
}

function getDeepElement(x: number, y: number): Element | undefined {
    const el = document.elementFromPoint(x, y);
    if (!el) return;

    const crawlShadows = (node: Element): Element => {
        if (node?.shadowRoot) {
            const potential = node.shadowRoot.elementFromPoint(x, y);
            if (potential == node) {
                return node;
            } else if (potential?.shadowRoot) {
                return crawlShadows(potential);
            } else {
                return potential ?? node;
            }
        } else {
            return node;
        }
    };

    const nested_shadow = crawlShadows(el);
    return nested_shadow ?? el;
}

/** Updates an element's instance id and and component name attributes. Called by the editor when it resolves which React component an element belongs to. */
export function updateElementInstance(
    domId: string,
    instanceId: string,
    component: string,
) {
    const el = getHTMLElement(domId);
    if (!el) {
        console.warn('Failed to updateElementInstance: Element not found');
        return;
    }

    el.setAttribute(EditorAttributes.DATA_MINO_INSTANCE_ID, instanceId);
    el.setAttribute(EditorAttributes.DATA_MINO_COMPONENT_NAME, component);
}

/** Returns the parent element as a **DomElement**, or null if there's no parent */
export function getParentElement(domId: string) {
    const el = getHTMLElement(domId);
    if (!el?.parentElement) return null;

    return getDomElement(el.parentElement, false);
}

/** Returns the number of direct child elements */
export function getChildrenCount(domId: string) {
    const el = getHTMLElement(domId);
    if (!el?.parentElement) return null;

    return el.children.length;
}

/** Returns the offset parent (the nearest positioned ancestor used for absolute/relative positioning calculations) as a **DomElement**. */
export function getOffset(domId: string) {
    const el = getHTMLElement(domId);
    if (!el) return null;

    return getDomElement(el.offsetParent as HTMLElement, false);
}
