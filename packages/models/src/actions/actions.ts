import type { ActionLocation } from './location';
import type { ActionTarget } from './target';

export interface EditTextResult {
    originalContent: string;
}

interface BaseActionElement {
    domId: string;
    oid: string;
    branchId: string;
    tagName: string;
    attributes: Record<string, string>;
    styles: Record<string, string>;
    textContent: string | null;
}

export interface ActionElement extends BaseActionElement {
    children: ActionElement[];
}

export interface PasteParams {
    oid: string;
    domId: string;
}

interface BaseInsertRemoveAction {
    type: string;
    targets: ActionTarget[];
    location: ActionLocation;
    element: ActionElement;
    editText: boolean | null;
    pasteParams: PasteParams | null;
    codeBlock: string | null;
}

export interface InsertElementAction extends BaseInsertRemoveAction {
    type: 'insert-element';
}

export interface RemoveElementAction extends BaseInsertRemoveAction {
    type: 'remove-element';
}

export interface GroupContainer {
    domId: string;
    oid: string;
    tagName: string;
    attributes: Record<string, string>;
}
