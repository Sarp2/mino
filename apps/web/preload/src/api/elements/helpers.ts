import type {
    ActionLocation,
    DomElement,
    ParentDomElement,
} from '@mino/models';

import { EditorAttributes } from '@/constants';
import { getInstanceId, getOid } from '@/helpers/ids';
import { getBranchId, getFrameId } from '../state';
import { getStyles } from './style';

/** Finds the deepest DOM element at (x, y) coordinates. Crawls into shadow DOM roots recursively to find elements inside web components. */
export function getDeepElement(x: number, y: number): Element | undefined {
    const el = document.elementFromPoint(x, y);
    if (!el) return;

    const crawShadows = (node: Element): Element => {
        if (node?.shadowRoot) {
            const potential = node.shadowRoot.elementFromPoint(x, y);
            if (potential === node) {
                return node;
            } else if (potential?.shadowRoot) {
                return crawShadows(potential);
            } else {
                return potential ?? node;
            }
        } else {
            return node;
        }
    };

    const nested_shadow = crawShadows(el);
    return nested_shadow || el;
}

/** Builds a DomElement object from an HTML element - the standard data structure the editor uses. Includes dom id, oid, frame/branch ids, bounding rect, tag name, parent info, and optionally styles. This is what gets sent to the parent editor whenever it asks about an element. */
export function getDomElement(el: HTMLElement, getStyle: boolean): DomElement {
    const parent = el.parentElement;
    const parentDomElement: ParentDomElement | null = parent
        ? {
              // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
              domId: parent.getAttribute(
                  EditorAttributes.DATA_MINO_DOM_ID,
              ) as string,
              frameId: getFrameId(),
              branchId: getBranchId(),
              oid: parent.getAttribute(EditorAttributes.DATA_MINO_ID),
              instanceId: parent.getAttribute(
                  EditorAttributes.DATA_MINO_INSTANCE_ID,
              )!,
              rect: parent.getBoundingClientRect(),
          }
        : null;

    const rect = el.getBoundingClientRect();
    const styles = getStyle ? getStyles(el) : null;

    const domElement: DomElement = {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        domId: el.getAttribute(EditorAttributes.DATA_MINO_DOM_ID) as string,
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        oid: el.getAttribute(EditorAttributes.DATA_MINO_ID) as string,
        frameId: getFrameId(),
        branchId: getBranchId(),
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        instanceId: el.getAttribute(
            EditorAttributes.DATA_MINO_INSTANCE_ID,
        ) as string,
        rect,
        tagName: el.tagName,
        parent: parentDomElement,
        styles,
    };
    return domElement;
}

/** Restores an element's inline styles from the saved backup attribute. Used after drag operations to put the element back to its original styling */
export function restoreElementStyle(el: HTMLElement) {
    try {
        const saved = el.getAttribute(
            EditorAttributes.DATA_MINO_DRAG_SAVED_STYLE,
        );
        if (saved) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const style = JSON.parse(saved);
            for (const key in style) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
                el.style[key as any] = style[key];
            }
        }
    } catch (error) {
        console.warn('Error restoring style', error);
    }
}

/** Determines where an element sits in in the DOM - returns its parent's dom id/oid and the element's index among its siblings. Used by action system to know where to insert/remove/move elements. */
export function getElementLocation(
    targetEl: HTMLElement,
): ActionLocation | undefined {
    const parent = targetEl.parentElement;
    if (!parent) return;

    const location: ActionLocation = {
        type: 'index',
        targetDomId: parent.getAttribute(EditorAttributes.DATA_MINO_DOM_ID)!,
        targetOid: getInstanceId(parent) ?? getOid(parent) ?? null,
        index: Array.from(targetEl.parentElement.children ?? []).indexOf(
            targetEl,
        ),
        originalIndex: Array.from(
            targetEl.parentElement?.children ?? [],
        ).indexOf(targetEl),
    };

    return location;
}

/** Extracts only the direct text content of an element, ignoring child element text. Filters to text nodes only and joins them. */
export function getImmediateTextContent(el: HTMLElement): string | undefined {
    const stringArr = Array.from(el.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent);

    if (stringArr.length === 0) return;

    return stringArr.join('');
}
