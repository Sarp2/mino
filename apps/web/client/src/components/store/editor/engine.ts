import { makeAutoObservable } from 'mobx';

import { ActionManager } from './action';
import { CanvasManager } from './canvas';
import { ElementsManager } from './element';
import { FramesManager } from './frames';
import { HistoryManager } from './history';
import { OverlayManager } from './overlay';
import { StateManager } from './state';
import { StyleManager } from './style';

export class EditorEngine {
    readonly projectId: string;
    readonly state: StateManager = new StateManager();
    readonly canvas: CanvasManager = new CanvasManager(this);
    readonly frames: FramesManager = new FramesManager(this);
    readonly overlay: OverlayManager = new OverlayManager(this);
    readonly elements: ElementsManager = new ElementsManager(this);
    readonly style: StyleManager = new StyleManager(this);
    readonly history: HistoryManager = new HistoryManager(this);
    readonly action: ActionManager = new ActionManager(this);

    constructor(projectId: string) {
        this.projectId = projectId;
        makeAutoObservable(this);
    }

    init() {
        // TODO: Implement it
    }

    clear() {
        this.state.clear();
        this.canvas.clear();
    }

    async refreshLayers() {
        for (const frame of this.frames.getAll()) {
            if (!frame.view) {
                console.error('No frame view found');
                continue;
            }
            await frame.view.processDom();
        }
    }
}
