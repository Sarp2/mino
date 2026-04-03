import type { DomElement, EditTextResult, LayerNode } from '@mino/models';

import { EditorAttributes } from '../../constants';
import { getHTMLElement } from '../../helpers';
import { buildLayerTree } from '../dom';
import { getDomElement, restoreElementStyle } from './helpers';

export function editTextByDomId(
    domId: string,
    content: string,
): DomElement | null {
    const el: HTMLElement | null = getHTMLElement(domId);
    if (!el) return null;

    updateTextContent(el, content);
    return getDomElement(el, true);
}
/** Finds the element and validates it can be directly edited (**only text nodes and br children**). Returns original content or null if the element has complex children. */
export function startEditingText(domId: string): EditTextResult | null {
    const el = getHTMLElement(domId);
    if (!el) {
        console.warn(
            'Start editing text failed. No element for selector: ',
            domId,
        );
        return null;
    }

    // Filter comment nodes
    const childNodes = Array.from(el.childNodes).filter(
        (node) => node.nodeType !== Node.COMMENT_NODE,
    );

    let targetEl: HTMLElement | null = null;

    // Check for element type
    const hasOnlyTextAndBreaks = childNodes.every(
        (node) =>
            node.nodeType === Node.TEXT_NODE ||
            (node.nodeType === Node.ELEMENT_NODE &&
                (node as Element).tagName.toLocaleLowerCase() === 'br'),
    );

    if (childNodes.length === 0) {
        targetEl = el;
    } else if (
        childNodes.length === 1 &&
        childNodes[0]?.nodeType === Node.TEXT_NODE
    ) {
        targetEl = el;
    } else if (hasOnlyTextAndBreaks) {
        // Handle elements with text and <br> tags
        targetEl = el;
    }

    if (!targetEl) {
        console.warn(
            'Start editing text failed. No target element found for selector: ',
            domId,
        );
        return null;
    }

    const originalContent = extractTextContent(el);
    prepareElementForEditing(targetEl);

    return { originalContent };
}

/** Splits the content on newlines and builds safe DOM nodes - text nodes interleaved with <br> elements. Prevents XSS by never using innerHTML with raw input. */
function updateTextContent(el: HTMLElement, content: string): void {
    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');

    el.innerHTML = '';
    lines.forEach((line, index) => {
        el.appendChild(document.createTextNode(line));
        if (index < lines.length - 1) {
            el.appendChild(document.createElement('br'));
        }
    });
}

/** Updates the element's text content and returns the updated DomElement and rebuilt layer tree. */
export function editText(
    domId: string,
    content: string,
): { domEl: DomElement; newMap: Map<string, LayerNode> | null } | null {
    const el = getHTMLElement(domId);
    if (!el) {
        console.warn(
            'Stop editing text failed. No element for selector: ',
            domId,
        );
        return null;
    }

    prepareElementForEditing(el);
    updateTextContent(el, content);

    return {
        domEl: getDomElement(el, true),
        newMap: buildLayerTree(el),
    };
}

export function stopEditingText(
    domId: string,
): { newContent: string; domEl: DomElement } | null {
    const el = getHTMLElement(domId);
    if (!el) {
        console.warn(
            'Stop editing text failed. No element for selector: ',
            domId,
        );
        return null;
    }

    cleanUpElementAfterEditing(el);
    return {
        newContent: extractTextContent(el),
        domEl: getDomElement(el, true),
    };
}

/** Sets the editing attribute on the element to mark it as active. */
function prepareElementForEditing(el: HTMLElement) {
    el.setAttribute(EditorAttributes.DATA_MINO_EDITING_TEXT, 'true');
}

/** Restores saved styles and removes editing attributes. */
function cleanUpElementAfterEditing(el: HTMLElement) {
    restoreElementStyle(el);
    removeEditingAttributes(el);
}

function removeEditingAttributes(el: HTMLElement) {
    el.removeAttribute(EditorAttributes.DATA_MINO_EDITING_TEXT);
}

/** Replaces **br** tags with newlines, strips remaining HTML tags, then decodes HTML entities via a textarea to return plain text. */
function extractTextContent(el: HTMLElement): string {
    let content = el.innerHTML;
    content = content.replace(/<br\s*\/?>/gi, '\n');
    content = content.replace(/<[^>]*>/g, '');

    const textArea = document.createElement('textarea');
    textArea.innerHTML = content;
    return textArea.value;
}

export function isChildTextEditable(_oid: string): boolean | null {
    return true;
}
