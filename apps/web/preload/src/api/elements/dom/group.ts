import type {
    ActionTarget,
    DomElement,
    GroupContainer,
    LayerNode,
} from '@mino/models';

import { buildLayerTree } from '../../../api/dom';
import { EditorAttributes } from '../../../constants';
import { getHTMLElement } from '../../../helpers';
import { getOrAssignDomId } from '../../../helpers/ids';
import { getDomElement } from '../helpers';

/** Wraps the given children inside a new container element inside the parent.
   *  Clones each child into the container, hides the originals, and inserts the container
   *  at the position of the first child. Returns the container's DomElement and updated
  layer tree. */
export function groupElements(
    parent: ActionTarget,
    container: GroupContainer,
    children: Array<ActionTarget>,
): { domEl: DomElement; newMap: Map<string, LayerNode> | null } | null {
    const parentEl = getHTMLElement(parent.domId);
    if (!parentEl) {
        console.warn('Failed to find parent element', parent.domId);
        return null;
    }

    const containerEl = createContainerElement(container);

    // Find child elements and their positions
    const childrenMap = new Set(children.map((c) => c.domId));
    const childrenWithIndices = Array.from(parentEl.children)
        .map((child, index) => ({
            element: child as HTMLElement,
            index,
            domId: getOrAssignDomId(child as HTMLElement),
        }))
        .filter(({ domId }) => childrenMap.has(domId));

    if (childrenWithIndices.length === 0) {
        console.warn('No valid children found to group');
        return null;
    }

    // Insert container at the position of the first child
    const insertIndex = Math.min(...childrenWithIndices.map((c) => c.index));
    parentEl.insertBefore(containerEl, parentEl.children[insertIndex] ?? null);

    // Move children into container
    childrenWithIndices.forEach(({ element }) => {
        const newElement = element.cloneNode(true) as HTMLElement;

        newElement.setAttribute(EditorAttributes.DATA_MINO_INSERTED, 'true');
        containerEl.appendChild(newElement);
        element.style.display = 'none';
        removeIdsFromChildElement(element);
    });

    const domEl = getDomElement(containerEl, true);

    return {
        domEl,
        newMap: buildLayerTree(containerEl),
    };
}

/** Dissolves a container by moving all its children directly into the parent, then removes the empty container element. Returns the parent's DomElement and updated layer tree. */
export function ungroupElements(
    parent: ActionTarget,
    container: GroupContainer,
): { domEl: DomElement; newMap: Map<string, LayerNode> | null } | null {
    const parentEl = getHTMLElement(parent.domId);
    if (!parentEl) {
        console.warn(`Parent element not found: ${parent.domId}`);
        return null;
    }

    let containerEl: HTMLElement | null;

    if (container.domId) {
        containerEl = getHTMLElement(container.domId);
    } else {
        console.warn('Container domId is required for ungrouping');
        return null;
    }

    if (!containerEl) {
        console.warn(`Container element not found for ungrouping`);
        return null;
    }

    // Move all children of the container to the parent
    const children = Array.from(containerEl.children) as HTMLElement[];
    children.forEach((child) => {
        parentEl.appendChild(child);
    });

    // Remove the empty container
    containerEl.remove();

    const domEl = getDomElement(parentEl, true);

    return {
        domEl,
        newMap: buildLayerTree(parentEl),
    };
}

/** Creates a new HTML Element from the GroupContainer descriptor - sets tags, attributes, and the mino domId/oid/inserted markers. */
function createContainerElement(target: GroupContainer): HTMLElement {
    const containerEl = document.createElement(target.tagName);
    Object.entries(target.attributes).forEach(([key, value]) => {
        containerEl.setAttribute(key, value);
    });

    containerEl.setAttribute(EditorAttributes.DATA_MINO_INSERTED, 'true');
    containerEl.setAttribute(EditorAttributes.DATA_MINO_ID, target.domId);
    containerEl.setAttribute(EditorAttributes.DATA_MINO_ID, target.oid);

    return containerEl;
}

/** remove data-mino-dom-id, data-mino-id, and data-mino-inserted from an element
 *  and all its descendants recursively. */
function removeIdsFromChildElement(el: HTMLElement) {
    el.removeAttribute(EditorAttributes.DATA_MINO_DOM_ID);
    el.removeAttribute(EditorAttributes.DATA_MINO_ID);
    el.removeAttribute(EditorAttributes.DATA_MINO_INSERTED);

    const children = Array.from(el.children);
    if (children.length === 0) return;

    children.forEach((child) =>
        removeIdsFromChildElement(child as HTMLElement),
    );
}
