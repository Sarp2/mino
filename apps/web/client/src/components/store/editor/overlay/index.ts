import { debounce } from 'lodash';
import { makeAutoObservable, reaction } from 'mobx';

import type { RectDimensions } from '@mino/models';
import type { EditorEngine } from '../engine';

import { OverlayState } from './state';
import { adaptRectToCanvas } from './utils';

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
                void this.refresh();
            },
        );
    }

    undebouncedRefresh = async () => {
        // TODO: Finished it when TextManager is done
    };

    refresh = debounce(this.undebouncedRefresh, 100, { leading: true });

    showMeasurement() {
        this.editorEngine.overlay.removeMeasurement();
        if (
            !this.editorEngine.elements.selected.length ||
            !this.editorEngine.elements.hovered
        ) {
            return;
        }

        const selectedEl = this.editorEngine.elements.selected[0];
        if (!selectedEl) return;

        const hoverEl = this.editorEngine.elements.hovered;
        const frameId = selectedEl.frameId;

        const frameData = this.editorEngine.frames.get(frameId);
        if (!frameData) {
            return;
        }

        const { view } = frameData;
        if (!view) {
            console.error('No frame view found');
            return;
        }

        const selectedRect = adaptRectToCanvas(selectedEl.rect, view);
        const hoverRect = adaptRectToCanvas(hoverEl.rect, view);

        this.editorEngine.overlay.updateMeasurement(selectedRect, hoverRect);
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
