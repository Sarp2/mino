/* eslint-disable prettier/prettier */
import type { Frame } from '@mino/models';
import type { PromisifiedPenpalChildMethods } from '@mino/penpal';
import { FrameNavigationManager } from './navigation';
import type { EditorEngine } from '..';
import { makeAutoObservable } from 'mobx';
import { debounce } from 'lodash';
import { vanillaApi } from '@/trpc/vanilla';
import { roundDimensions } from './dimension';
import { v4 as uuid } from 'uuid';
import { calculateNonOverlappingPosition } from '@mino/utility';


// TODO: Move this type definition to view.tsx when view.tsx component is build
export type IframeView = HTMLIFrameElement & {
    setZoomLevel: (level: number) => void;
    supportsOpenDevTools: () => boolean;
    reload: () => void;
    isLoading: () => boolean;
} & PromisifiedPenpalChildMethods;

export interface FrameData {
    frame: Frame;
    view: IframeView | null;
    selected: boolean;
}

/** Manages all iframes on the canvas - stores frame data (Frame model + live IframeView + selection state), handles registration/deregistration of view, selection, navigation, CRUD operations, and persistence to DB. */
export class FramesManager {
    private _frameIdToData = new Map<string, FrameData>();
    private _navigation = new FrameNavigationManager();
    private _disposers: Array<() => void> = [];

    constructor(private editorEngine: EditorEngine) {
        makeAutoObservable(this);
    }

    private updateFrameSection(id: string, selected: boolean): void {
        const data = this._frameIdToData.get(id);
        if (data) {
            data.selected = selected;
            this._frameIdToData.set(id, data);
        }
    }

    applyFrames(frames: Frame[]) {
        frames.forEach((frame, index) => {
            this._frameIdToData.set(frame.id, {
                frame,
                view: null,
                // Select the first time
                selected: index === 0,
            });
        });
    }

    get selected(): FrameData[] {
        return Array.from(this._frameIdToData.values()).filter((w) => w.selected);
    }

    get navigation(): FrameNavigationManager {
        return this._navigation;
    }

    getAll(): FrameData[] {
        return Array.from(this._frameIdToData.values());
    }

    getByBranchId(branchId: string): FrameData[] {
        return Array.from(this._frameIdToData.values()).filter((w) => w.frame.branchId === branchId);
    }

    get(id: string): FrameData | null {
        return this._frameIdToData.get(id) ?? null;
    }

    registerView(frame: Frame, view: IframeView) {
        const isSelected = this.isSelected(frame.id);
        this._frameIdToData.set(frame.id, { frame, view, selected: isSelected });
        
        const framePathname = new URL(view.src).pathname;
        this._navigation.registerFrame(frame.id, framePathname);
    }

    deregister(frame: Frame) {
        this._frameIdToData.delete(frame.id);
    }

    deregisterAll() {
        this._frameIdToData.clear();
    }

    isSelected(id: string): boolean {
        return this._frameIdToData.get(id)?.selected ?? false;
    }

    select(frames: Frame[], multiselect = false) {
        if (!multiselect) {
            this.deselectAll();
            for (const frame of frames) {
                this.updateFrameSection(frame.id, true);
            }
        } else {
            for (const frame of frames) {
                this.updateFrameSection(frame.id, !this.isSelected(frame.id));
            }
        }

        this.notify();
    }

    deselect(frame: Frame) {
        this.updateFrameSection(frame.id, false);
        this.notify();
    }

    deselectAll() {
        for (const [id] of this._frameIdToData) {
            this.updateFrameSection(id, false);
        }
        this.notify();
    }

    private notify() {
        this._frameIdToData = new Map(this._frameIdToData);
    }

    clear() {
        this.deregisterAll();
        this._disposers.forEach((dispose) => dispose());
        this._disposers = [];
        this._navigation.clearAllHistory();
    }

    disposeFrame(frameId: string) {
        this._frameIdToData.delete(frameId);
        // TODO: Uncomment this when AST Manager is finished
        // this.editorEngine?.ast?.mappings?.remove(frameId);
        this._navigation.removeFrame(frameId);
    }

    reloadAllViews() {
        for (const frameData of this.getAll()) {
            frameData.view?.reload();
        }
    }

    reloadView(id: string) {
        const frameData = this.get(id);
        if (!frameData?.view) {
            console.error('Frame view not found for reload', id);
            return;
        }
        frameData.view.reload();
    }

    // Navigation history methods
    async goBack(frameId: string): Promise<void> {
        const previousPath = this.navigation.goBack(frameId);
        if (previousPath) {
            await this.navigateToPath(frameId, previousPath, false);
        }
    }

    async goForward(frameId: string): Promise<void> {
        const nextPath = this._navigation.goForward(frameId);
        if (nextPath) {
            await this.navigateToPath(frameId, nextPath, false);

        }
    }

    async delete(id: string) {
        const frameData = this.get(id);
        if (!frameData?.view) {
            console.error('Frame not found for delete', id);
            return;
        }

        const success = await vanillaApi.frame.delete.mutate({
            frameId: frameData.frame.id,
        });

        if (success) {
            this.disposeFrame(frameData.frame.id);
        } else {
            console.error('Failed to delete frame');
        }
    }

    async create(frame: Frame) {
        const rounded = roundDimensions(frame);
        const success = await vanillaApi.frame.create.mutate({
            id: rounded.id,
            canvasId: rounded.canvasId,
            branchId: rounded.branchId,
            url: rounded.url,
            x: String(rounded.position.x),
            y: String(rounded.position.y),
            width: String(rounded.dimension.width),
            height: String(rounded.dimension.height),
        });

        if (success) {
            this._frameIdToData.set(frame.id, { frame, view: null, selected: false });
        } else {
            console.error('Failed to create frame');
        }
    }

    async duplicate(id: string) {
        const frameData = this.get(id);
        if (!frameData?.view) {
            console.error('Frame view not found for duplicate', id);
            return;
        }

        const frame = frameData.frame;
        const allFrames = this.getAll().map((frameData) => frameData.frame);

        const proposedFrame: Frame = {
            ...frame,
            id: uuid(),
            position: {
                x: frame.position.x + frame.dimension.width + 100,
                y: frame.position.y,
            }
        }

        const newPosition = calculateNonOverlappingPosition(proposedFrame, allFrames);
        const newFrame: Frame = {
            ...proposedFrame,
            position: newPosition,
        };

        await this.create(newFrame);
    }

    async navigateToPath(frameId: string, path: string, addHistory = true): Promise<void> {
        const frameData = this.get(frameId);
        if (!frameData?.view) {
            console.warn('No frame view available for navigation');
            return;
        }

        try {
            const currentUrl = frameData.view.src;
            const baseUrl = currentUrl ? new URL(currentUrl).origin : null;

            if (!baseUrl) {
                console.warn('No base URL found');
                return;
            }

            await this.updateAndSaveStorage(frameId, { url: `${baseUrl}${path}` });
            // TODO: Uncomment this out when pageManager is finished
            // this.editorEngine.pages.setActivePath(frameId, path);

            if (addHistory) {
                this._navigation.addToHistory(frameId, path);
            }
        } catch (error) {
            console.error('Navigation failed: ', error);
        }
    }

    async updateAndSaveStorage(frameId: string, frame: Partial<Frame>) {
        const existingFrame = this.get(frameId);
        if (existingFrame) {
            const newFrame = { ...existingFrame.frame, ...frame };
            this._frameIdToData.set(frameId, {
                ...existingFrame,
                frame: newFrame,
                selected: existingFrame.selected,
            })
        }
        await this.saveToStorage(frameId, frame);
    }

    saveToStorage = debounce(this.undebouncedSaveToStorage.bind(this), 1000);

    async undebouncedSaveToStorage(frameId: string, frame: Partial<Frame>) {
        try {
            const success = await vanillaApi.frame.update.mutate({
                ...frame,
                id: frameId,
            });

            if (!success) {
                console.error('Failed to update frame');
            }
        } catch (error) {
            console.error('Failed to update frame', error);
        }
    }

    canDelete() {
        const selectedFrames = this.selected;
        if (selectedFrames.length > 0) {
            // Check if any selected frame is the last frame in its branch
            for (const selectedFrame of selectedFrames) {
                const branchId = selectedFrame.frame.branchId;
                const framesInBranch = this.getAll().filter((frameData) => frameData.frame.branchId === branchId);
                if (framesInBranch.length <= 1) {
                    return false; // Cannot delete if this is the last frame in the branch
                }
            }
            return true;
        }

        // Fallback to checking total frame if none are selected
        return this.getAll().length > 1;
    }

    canDuplicate() {
        return this.selected.length > 0;
    }

    calculateNonOverlappingPosition(propsedFrame: Frame): { x: number, y: number } {
        const allFrames = this.getAll().map((frameData) => frameData.frame);
        return calculateNonOverlappingPosition(propsedFrame, allFrames);
    }

    async duplicateSelected() {
        for (const frame of this.selected) {
            await this.duplicate(frame.frame.id);
        }
    }

    async deleteSelected() {
        if (!this.canDelete()) {
            console.error('Cannot delete the last frame');
            return;
        }

        for (const frame of this.selected) {
            await this.delete(frame.frame.id);
        }
    }
}
