import { makeAutoObservable, reaction } from 'mobx';

import type { RectDimensions } from '@mino/models';
import type { EditorEngine } from '../engine';

import { OverlayState } from './state';

/** Keeps overlay visuals in sync with editor state - refreshes selection rects, text editor position, and measurement lines when canvas moves or selection changes. Converts iframe coordinates to canvas coordinates via adaptToRectValues. */
export class OverlayManager {
    state: OverlayState = new OverlayState();
    private canvasReactionDisposer?: () => void;

    constructor(private editorEngine: EditorEngine) {
        makeAutoObservable(this);
    }

    init() {
        this.canvasReactionDisposer = reaction(
            () => ({
                position: this.editorEngine.canvas?.position,
                scale: this.editorEngine.canvas?.scale,
                shouldHideOverlay: this.editorEngine.state?.shouldHideOverlay,
            }),
            () => {
                // TODO: Uncomment it out when ElementsManager is done
                // this.refresh();
            },
        );
    }

    undebouncedRefresh = async () => {
        // TODO: Finished it when ElementsManager is done
    };

    showMeasurement() {
        // TODO: Finished it when ElementsManager is done
    }

    updateMeasurement = (fromRect: RectDimensions, toRect: RectDimensions) => {
        this.state.updateMeasurement(fromRect, toRect);
    };

    removeMeasurement = () => {
        this.state.removeMeasurement();
    };

    clearUI = () => {
        this.removeMeasurement();
        this.state.clear();
    };

    clear = () => {
        this.canvasReactionDisposer?.();
        this.canvasReactionDisposer = undefined;
    };
}
