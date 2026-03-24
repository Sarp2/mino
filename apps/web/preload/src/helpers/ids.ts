import { nanoid } from 'nanoid/non-secure';

import { EditorAttributes } from '@/constants';

/** Reads the dom id from an element's data attribute. If it doesn't have one, generates a nanoid and assigns it. */
export function getOrAssignDomId(node: HTMLElement): string {
    let domId = node.getAttribute(EditorAttributes.DATA_MINO_DOM_ID);
    if (!domId) {
        domId = `odid-${nanoid()}`;
        node.setAttribute(EditorAttributes.DATA_MINO_DOM_ID, domId);
    }

    return domId;
}

export const VALID_DATA_ATTR_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789-._:';

/** Reads the source-code-level identifier (oid). This is stable across renders - it maps back to a specific JSX element in the user's code */
export function getOid(node: HTMLElement): string | null {
    return node.getAttribute(EditorAttributes.DATA_MINO_ID);
}

/** Reads the component instance id. When the same component is used multiple times, each usage gets a unique instance id */
export function getInstanceId(node: HTMLElement): string | null {
    return node.getAttribute(EditorAttributes.DATA_MINO_INSTANCE_ID);
}
