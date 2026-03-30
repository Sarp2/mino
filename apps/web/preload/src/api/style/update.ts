import type { Change, DomElement, StyleChange } from '@mino/models';

import { getElementByDomId } from '../elements';
import { cssManager } from './css-manager';

/** Applies a style change to the element via CSSManager and returns the updated DomElement with fresh styles. */
export function updateStyle(
    domId: string,
    change: Change<Record<string, StyleChange>>,
): DomElement | null {
    cssManager.updateStyle(domId, change.updated);
    return getElementByDomId(domId, true);
}
