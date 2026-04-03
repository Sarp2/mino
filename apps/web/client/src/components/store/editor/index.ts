import { makeAutoObservable } from 'mobx';

import { CanvasManager } from './canvas';
import { StateManager } from './state';

export class EditorEngine {
    readonly projectId: string;
    readonly state: StateManager = new StateManager();
    readonly canvas: CanvasManager = new CanvasManager(this);

    constructor(projectId: string) {
        this.projectId = projectId;
        makeAutoObservable(this);
    }

    init() {
        // TODO: Implement it
    }

    clear() {
        // this.state.clear();
        // this.canvas.clear();
    }
}
