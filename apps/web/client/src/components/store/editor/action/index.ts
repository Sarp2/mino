import { debounce } from 'lodash';

import type {
    Action,
    DomElement,
    EditTextAction,
    GroupElementsAction,
    InsertElementAction,
    InsertImageAction,
    LayerNode,
    MoveElementAction,
    RemoveElementAction,
    RemoveImageAction,
    UngroupElementsAction,
    UpdateStyleAction,
} from '@mino/models';
import type { EditorEngine } from '../engine';
import type { FrameData } from '../frames';

import { EditorMode } from '@mino/models';
import { assertNever } from '@mino/web-preload/src/helpers';

/** Central dispatcher for all editor actions. Pushes every action to history (undo/redo),
 *  then applies it to the iframe via penpal. Undo/redo writes to code instead,
 *  letting hot reload update the iframe. */
export class ActionManager {
    constructor(private editorEngine: EditorEngine) {}

    async run(action: Action) {
        await this.editorEngine.history.push(action);
        await this.dispatch(action);
    }

    async undo() {
        const action = this.editorEngine.history.undo();
        if (action === null) return;

        // TODO: Uncomment it out when CodeManager is done
        // await this.editorEngine.code.write(action);
    }

    async redo() {
        const action = this.editorEngine.history.redo();
        if (action === null) return;

        // TODO: Uncomment it out when CodeManager is done
        // await this.editorEngine.code.write(action);
    }

    private async dispatch(action: Action) {
        switch (action.type) {
            case 'update-style':
                await this.updateStyle(action);
                break;
            case 'insert-element':
                // Disabling real-time insert since this is buggy. Will still work but not as fast.
                // await this.insertElement(action);
                break;
            case 'remove-element':
                await this.removeElement(action);
                break;
            case 'move-element':
                await this.moveElement(action);
                break;
            case 'edit-text':
                await this.editText(action);
                break;
            case 'group-elements':
                await this.groupElements(action);
                break;
            case 'ungroup-elements':
                await this.ungroupElements(action);
                break;
            case 'write-code':
                break;
            case 'insert-image':
                this.insertImage(action);
                break;
            case 'remove-image':
                this.removeImage(action);
                break;
            default:
                assertNever(action);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async updateStyle({ targets }: UpdateStyleAction) {
        // TODO: Finished it when ThemeManager is done
    }

    debouncedRefreshDomElement(domEls: DomElement[]) {
        this.editorEngine.elements.click(domEls);
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    refreshDomElement = debounce(this.debouncedRefreshDomElement, 100, {
        leading: true,
    });

    private async insertElement({
        targets,
        element,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        editText,
        location,
    }: InsertElementAction) {
        for (const target of targets) {
            const frameData = this.editorEngine.frames.get(target.frameId);
            if (!frameData?.view) {
                console.error('Failed to get frameView');
                return;
            }

            try {
                const result = await frameData.view.insertElement(
                    element,
                    location,
                );
                if (!result) {
                    console.error('Failed to insert element');
                    return;
                }

                void this.refreshAnClickMutatedElement(
                    result.domEl,
                    frameData,
                    result.newMap,
                );
            } catch (err) {
                console.error('Error inserting element:', err);
            }
        }
    }

    private async removeElement({ targets, location }: RemoveElementAction) {
        for (const target of targets) {
            const frameData = this.editorEngine.frames.get(target.frameId);
            if (!frameData?.view) {
                console.error('Failed to get frameView');
                return;
            }

            const result = await frameData.view.removeElement(location);
            if (!result) {
                console.error('Failed to remove element');
                return;
            }

            await this.editorEngine.overlay.refresh();
            void this.refreshAnClickMutatedElement(
                result.domEl,
                frameData,
                result.newMap,
            );
        }
    }

    private async moveElement({ targets, location }: MoveElementAction) {
        for (const target of targets) {
            const frameData = this.editorEngine.frames.get(target.frameId);
            if (!frameData?.view) {
                console.error('Failed to get frameView');
                return;
            }

            const result = await frameData.view.moveElement(
                target.domId,
                location.index,
            );
            if (!result) {
                console.error('Failed to move element');
                return;
            }

            await this.editorEngine.overlay.refresh();
            void this.refreshAnClickMutatedElement(
                result.domEl,
                frameData,
                result.newMap,
            );
        }
    }

    private async editText({ targets, newContent }: EditTextAction) {
        for (const target of targets) {
            const frameData = this.editorEngine.frames.get(target.frameId);
            if (!frameData?.view) {
                console.error('Failed to get frameView');
                return;
            }

            const result = await frameData.view.editText(
                target.domId,
                newContent,
            );

            if (!result) {
                console.log('Failed to edit text');
                return;
            }

            void this.refreshAnClickMutatedElement(
                result.domEl,
                frameData,
                result.newMap,
            );
        }
    }

    private async groupElements({
        parent,
        container,
        children,
    }: GroupElementsAction) {
        const frameData = this.editorEngine.frames.get(parent.frameId);
        if (!frameData?.view) {
            console.error('Failed to get frameView');
            return;
        }

        const result = await frameData.view.groupElements(
            parent,
            container,
            children,
        );

        if (!result) {
            console.error('Failed to group elements');
            return;
        }

        void this.refreshAnClickMutatedElement(
            result.domEl,
            frameData,
            result.newMap,
        );
    }

    private async ungroupElements({
        parent,
        container,
    }: UngroupElementsAction) {
        const frameData = this.editorEngine.frames.get(parent.frameId);
        if (!frameData?.view) {
            console.error('Failed to get frameView');
            return;
        }

        const result = await frameData.view.ungroupElements(parent, container);

        if (!result) {
            console.error('Failed to ungroup elements');
            return;
        }

        void this.refreshAnClickMutatedElement(
            result.domEl,
            frameData,
            result.newMap,
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private insertImage({ targets, image }: InsertImageAction) {
        targets.forEach((target) => {
            const frameView = this.editorEngine.frames.get(target.frameId);
            if (!frameView) {
                console.error('Failed to get frameView');
                return;
            }
        });

        // sendToWebview(frameView, WebviewChannels.INSERT_IMAGE, {
        //     domId: target.domId,
        //     image,
        // });
    }

    private removeImage({ targets }: RemoveImageAction) {
        targets.forEach((target) => {
            const frameData = this.editorEngine.frames.get(target.frameId);
            if (!frameData) {
                console.error('Failed to get frameView');
                return;
            }

            // sendToWebview(frameView, WebviewChannels.REMOVE_IMAGE, {
            //     domId: target.domId,
            // });
        });
    }

    async refreshAnClickMutatedElement(
        domEl: DomElement,
        frameData: FrameData,
        newMap: Map<string, LayerNode> | null,
    ) {
        this.editorEngine.state.editorMode = EditorMode.DESIGN;
        this.editorEngine.elements.click([domEl]);

        if (newMap) {
            // TODO: Uncomment it out when ASTManager is done
            // this.editorEngine.ast.updateMap(frameData.frame.id, newMap, domEl.domId);
        }
    }

    clear() {
        /** */
    }
}
