import { debounce } from 'lodash';
import { makeAutoObservable } from 'mobx';

import type { Canvas, RectPosition } from '@mino/models';
import type { EditorEngine } from '../index';

import { DefaultDesktopFrame } from '@mino/db';

import { vanillaApi } from '@/trpc/vanilla';

export class CanvasManager {
    private _id = '';
    private _scale = 0.7;
    private _position: RectPosition = { x: 175, y: 100 };

    constructor(private readonly editorEngine: EditorEngine) {
        this._position = this.getDefaultPanPosition();
        makeAutoObservable(this);
    }

    applyCanvas(canvas: Canvas) {
        this.saveCanvas.cancel();
        this._id = canvas.id;
        this._scale = canvas.scale ?? 0.7;
        this._position = canvas.position ?? this.getDefaultPanPosition();
    }

    getDefaultPanPosition(): RectPosition {
        let x = 200;
        let y = 100;
        const center = false;

        if (center) {
            x =
                window.innerWidth / 2 -
                (Number(DefaultDesktopFrame.width) * this._scale) / 2;
            y =
                window.innerHeight / 2 -
                (Number(DefaultDesktopFrame.height) * this._scale) / 2;
        }

        return { x, y };
    }

    get id() {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get scale() {
        return this._scale;
    }

    set scale(value: number) {
        this._scale = value;
        void this.saveCanvas();
    }

    get position() {
        return this._position;
    }

    set position(value: RectPosition) {
        this._position = value;
        void this.saveCanvas();
    }

    // 5 second debounce. Database is used to save working state per user, so we don't need to save too often.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    saveCanvas = debounce(this.undebouncedSaveCanvas, 5000);

    private async undebouncedSaveCanvas() {
        const success = await vanillaApi.userCanvas.update.mutate({
            projectId: this.editorEngine.projectId,
            canvasId: this.id,
            canvas: {
                scale: this.scale.toString(),
                x: this.position.x.toString(),
                y: this.position.y.toString(),
            },
        });

        if (!success) {
            console.log('Failed to update canvas');
        }
    }

    clear() {
        this.saveCanvas.cancel();
        this._scale = 0.7;
        this._position = this.getDefaultPanPosition();
    }
}
