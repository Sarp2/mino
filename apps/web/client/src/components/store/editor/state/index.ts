import { debounce } from 'lodash';
import { makeAutoObservable } from 'mobx';

import type {
    BranchTabValue,
    BrandTabValue,
    InsertMode,
    LeftPanelTabValue,
} from '@mino/models';

import { ChatType, EditorMode } from '@mino/models';

export class StateManager {
    private _canvasScrolling = false;
    hotkeysOpen = false;
    publishOpen = false;
    leftPanelLocked = false;
    canvasPanning = false;
    isDragSelecting = false;

    editorMode: EditorMode = EditorMode.DESIGN;
    insertMode: InsertMode | null = null;
    leftPanelTab: LeftPanelTabValue | null = null;
    brandTab: BrandTabValue | null = null;
    branchTab: BranchTabValue | null = null;
    manageBranchId: string | null = null;

    chatMode: ChatType = ChatType.EDIT;

    constructor() {
        makeAutoObservable(this);
    }

    set canvasScrolling(value: boolean) {
        this._canvasScrolling = value;
        this.resetCanvasScrolling();
    }

    get shouldHideOverlay() {
        return this._canvasScrolling || this.canvasPanning;
    }

    private resetCanvasScrolling() {
        this.resetCanvasScrollingDebounced();
    }

    private resetCanvasScrollingDebounced = debounce(() => {
        this.canvasScrolling = false;
    }, 150);

    clear() {
        this.hotkeysOpen = false;
        this.publishOpen = false;
        this.branchTab = null;
        this.manageBranchId = null;
        this.resetCanvasScrollingDebounced.cancel();
    }
}
