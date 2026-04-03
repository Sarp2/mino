import type {
    ActionElement,
    ActionLocation,
    CoreElementType,
    DomElement,
    DynamicType,
} from '@mino/models';

import { getBranchId } from '../../../api/state';
import { EditorAttributes } from '../../../constants';
import { getHTMLElement } from '../../../helpers';
import { getInstanceId, getOid, getOrAssignDomId } from '../../../helpers/ids';
import { getDomElement, getImmediateTextContent } from '../helpers';

/** Looks up element by domId, returns it as an **ActionElement** (oid, tag, attributes, children, styles). */
export function getActionElement(domId: string): ActionElement | null {
    const el = getHTMLElement(domId);
    if (!el) {
        console.warn('Element not found for domId: ', domId);
        return null;
    }

    return getActionElementFromHtmlElement(el);
}

/** Converts a live HTMLElement into an **ActionElement** - collects all attributes, resolves oid from instanceId or data-mino-id, and recurses into children. */
export function getActionElementFromHtmlElement(
    el: HTMLElement,
): ActionElement | null {
    const attributes: Record<string, string> = Array.from(el.attributes).reduce(
        (acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
        },
        {} as Record<string, string>,
    );

    const oid = getInstanceId(el) ?? getOid(el) ?? null;
    if (!oid) {
        console.warn('Element has no oid');
        return null;
    }

    return {
        oid,
        branchId: getBranchId(),
        domId: getOrAssignDomId(el),
        tagName: el.tagName.toLowerCase(),
        children: Array.from(el.children)
            .map((child) =>
                getActionElementFromHtmlElement(child as HTMLElement),
            )
            .filter(Boolean) as ActionElement[],
        attributes,
        textContent: getImmediateTextContent(el) ?? null,
        styles: {},
    };
}

/** Returns the **ActionLocation** of an element: which parent it lives in and at what index. Falls back to type 'append' if the elemnent isn't found amoung parent's children. */
export function getActionLocation(domId: string): ActionLocation | null {
    const el = getHTMLElement(domId);
    if (!el) {
        throw new Error(`Element not found: ${domId}`);
    }

    const parent = el.parentElement;
    if (!parent) {
        throw new Error('Inserted element has no parent');
    }

    const targetOid = getInstanceId(parent) ?? getOid(parent);
    if (!targetOid) {
        console.warn('Parent element has no oid');
        return null;
    }

    const targetDomId = getOrAssignDomId(parent);
    const index: number | undefined = Array.from(parent.children).indexOf(el);
    if (index === -1) {
        return {
            type: 'append',
            targetDomId,
            targetOid,
        };
    }

    return {
        type: 'index',
        targetDomId,
        targetOid,
        index,
        originalIndex: index,
    };
}

/** Reads **data-mino-dynamic-type** and **data-mino-core-element-type** attributes from the element and returns them as { dynamicType, coreType }. */
export function getElementType(domId: string): {
    dynamicType: DynamicType | null;
    coreType: CoreElementType | null;
} {
    const el = document.querySelector(
        `[${EditorAttributes.DATA_MINO_ID}="${domId}"]`,
    );

    if (!el) {
        console.warn('No element found', { domId });
        return { dynamicType: null, coreType: null };
    }

    const dynamicType =
        (el.getAttribute(
            EditorAttributes.DATA_MINO_DYNAMIC_TYPE,
        ) as DynamicType) ?? null;

    const coreType =
        (el.getAttribute(
            EditorAttributes.DATA_MINO_CORE_ELEMENT_TYPE,
        ) as CoreElementType) ?? null;

    return { dynamicType, coreType };
}

/** Writes **dynamicType** and **coreElementType** onto the element's data-mino-* attributes */
export function setElementType(
    domId: string,
    dynamicType: DynamicType | null,
    coreElementType: CoreElementType | null,
) {
    const el = document.querySelector(
        `[${EditorAttributes.DATA_MINO_ID}="${domId}"]`,
    );

    if (el) {
        if (dynamicType) {
            el.setAttribute(
                EditorAttributes.DATA_MINO_DYNAMIC_TYPE,
                dynamicType,
            );
        }

        if (coreElementType) {
            el.setAttribute(
                EditorAttributes.DATA_MINO_CORE_ELEMENT_TYPE,
                coreElementType,
            );
        }
    }
}

/** Finds the first element in body tag that has a data-mino-id attribute and returns as a **DomElement**. */
export function getFirstMinoElement(): DomElement | null {
    const body = document.body;
    const firstElement = body.querySelector(
        `[${EditorAttributes.DATA_MINO_ID}]`,
    );

    if (firstElement) return getDomElement(firstElement as HTMLElement, true);
    return null;
}
