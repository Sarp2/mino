import { penpalParent } from '../..';
import { EditorAttributes } from '../../constants';
import { buildLayerTree } from '../dom';

/** Sets up a **MutationObserver** on document.body watching for added/remove child elements. When elements with onlook dom ids are added or removed, rebuilds the affected parent's layer tree and sends the changes to the paren editor via penpal. */
export function listenForDomMutation() {
    const targetNode = document.body;
    const config = { childList: true, subtree: true };

    const observer = new MutationObserver((mutationsList) => {
        let added = new Map();
        let removed = new Map();

        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const parent = mutation.target as HTMLElement;

                // Handle added nodes
                mutation.addedNodes.forEach((node) => {
                    const el = node as HTMLElement;

                    if (
                        node.nodeType === Node.ELEMENT_NODE &&
                        el.hasAttribute(EditorAttributes.DATA_MINO_DOM_ID) &&
                        !shouldIgnoreMutatedNode(el)
                    ) {
                        dedupNewElement(el);
                        if (parent) {
                            const layerMap = buildLayerTree(parent);
                            if (layerMap) {
                                added = new Map([...added, ...layerMap]);
                            }
                        }
                    }
                });

                // Handle removed nodes
                mutation.removedNodes.forEach((node) => {
                    const el = node as HTMLElement;

                    if (
                        node.nodeType === Node.ELEMENT_NODE &&
                        el.hasAttribute(EditorAttributes.DATA_MINO_ID) &&
                        !shouldIgnoreMutatedNode(el)
                    ) {
                        if (parent) {
                            const layerMap = buildLayerTree(parent);
                            if (layerMap) {
                                removed = new Map([...removed, ...layerMap]);
                            }
                        }
                    }
                });
            }
        }

        if (added.size > 0 || removed.size > 0) {
            if (penpalParent) {
                penpalParent
                    .onWindowMutated({
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        added: Object.fromEntries(added),
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        removed: Object.fromEntries(removed),
                    })
                    .catch((error: Error) => {
                        console.error(
                            'Failed to send window mutation event: ',
                            error,
                        );
                    });
            }
        }
    });

    observer.observe(targetNode, config);
}

/** Listens for resize events and notifies the parent editor so it can update overlay positions. */
export function listenForResize() {
    function notifyResize() {
        if (penpalParent) {
            penpalParent.onWindowResized().catch((error: Error) => {
                console.error('Failed to send window resize event:', error);
            });
        }
    }

    window.addEventListener('resize', notifyResize);
}

/** Returns true if a mutated node should be ignored - either it's the mino stub element (drag placeholder) or it was inserted by the editor itself. */
function shouldIgnoreMutatedNode(node: HTMLElement): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (node.id === EditorAttributes.MINO_STUB_ID) return true;
    if (node.getAttribute(EditorAttributes.DATA_MINO_INSERTED)) return true;

    return false;
}

/** When a new element appears that has the same oid as an editor-inserted element, copies over the editor attributes (dom id, drag state, editing state, instance id) from the inserted element to the new one, then removes the duplicate. */
function dedupNewElement(newEl: HTMLElement) {
    const oid = newEl.getAttribute(EditorAttributes.DATA_MINO_ID);
    if (!oid) return;

    document
        .querySelectorAll(
            `[${EditorAttributes.DATA_MINO_ID}="${oid}"][${EditorAttributes.DATA_MINO_INSERTED}]`,
        )
        .forEach((targetEl) => {
            const ATTRIBUTES_TO_REPLACE = [
                EditorAttributes.DATA_MINO_DOM_ID,
                EditorAttributes.DATA_MINO_DRAG_SAVED_STYLE,
                EditorAttributes.DATA_MINO_EDITING_TEXT,
                EditorAttributes.DATA_MINO_INSTANCE_ID,
            ];

            ATTRIBUTES_TO_REPLACE.forEach((attr) => {
                const targetAttr = targetEl.getAttribute(attr);
                if (targetAttr) {
                    newEl.setAttribute(attr, targetAttr);
                }
            });

            targetEl.remove();
        });
}
