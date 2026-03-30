import { EditorAttributes } from '../../../constants';
import {
    DisplayDirection,
    findInsertionIndex as findFlexBlockInsertionIndex,
    findGridInsertionIndex,
    getDisplayDirection,
} from './helpers';

/** Creates a ghost placeholder div that mirrors the dragged element's size and class, appended to document.body as a drop position indicator. */
export function createStub(el: HTMLElement) {
    const stub = document.createElement('div');
    const styles = window.getComputedStyle(el);
    const className = el.className;

    stub.id = EditorAttributes.MINO_STUB_ID;
    stub.style.width = styles.width;
    stub.style.height = styles.height;
    stub.style.margin = styles.margin;
    stub.style.padding = styles.padding;
    stub.style.borderRadius = styles.borderRadius;
    stub.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    stub.style.display = 'none';
    stub.className = className;

    document.body.appendChild(stub);
}

/** Moves the stub to the closest insertion point under the cursor, accounting for flow-row, flex-column, and grid layouts. */
export function moveStub(el: HTMLElement, x: number, y: number) {
    const stub = document.getElementById(EditorAttributes.MINO_STUB_ID);
    if (!stub) return;

    const parent = el.parentElement;
    if (!parent) return;

    let displayDirection = el.getAttribute(
        EditorAttributes.DATA_MINO_DRAG_DIRECTION,
    );

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (!displayDirection) {
        displayDirection = getDisplayDirection(parent);
    }

    const parentStyle = window.getComputedStyle(parent);
    const isGridLayout = parentStyle.display === 'grid';
    const isFlexRow =
        !isGridLayout &&
        parentStyle.display === 'flex' &&
        (parentStyle.flexDirection === 'row' ||
            parentStyle.flexDirection === '');

    if (isFlexRow) {
        displayDirection = DisplayDirection.HORIZONTAL;
    }

    const siblings = Array.from(parent.children).filter(
        (child) => child !== el && child !== stub,
    );

    let insertionIndex;
    if (isGridLayout) {
        insertionIndex = findGridInsertionIndex(parent, siblings, x, y);
    } else {
        insertionIndex = findFlexBlockInsertionIndex(
            siblings,
            x,
            y,
            displayDirection as DisplayDirection,
        );
    }

    stub.remove();

    if (insertionIndex >= siblings.length) {
        parent.appendChild(stub);
    } else {
        parent.insertBefore(stub, siblings[insertionIndex] ?? null);
    }

    stub.style.display = 'block';
}

/** Removes the stub from the DOM if it exists. */
export function removeStub() {
    const stub = document.getElementById(EditorAttributes.MINO_STUB_ID);
    if (!stub) return;

    stub.remove();
}

/** Returns the stub's current index among the parent's children (excluding the dragged element), or -1 if no stub exists. */
export function getCurrentStubIndex(
    parent: HTMLElement,
    el: HTMLElement,
): number {
    const stub = document.getElementById(EditorAttributes.MINO_STUB_ID);
    if (!stub) return -1;

    const siblings = Array.from(parent.children).filter(
        (child) => child !== el,
    );
    return siblings.indexOf(stub);
}
