import { DOM_IGNORE_TAGS, EditorAttributes } from '../constants';

/** Finds an HTML element in the document by its mino id attribute */
export function getHTMLElement(domId: string): HTMLElement | null {
    return document.querySelector(
        `[${EditorAttributes.DATA_MINO_DOM_ID}="${domId}"]`,
    );
}

/** Builds a CSS attribute selector string for a given dom id. Optionally escapes special characters for use in CSS APIs */
export function getDomIdSelector(domId: string, escape = false) {
    const selector = `[${EditorAttributes.DATA_MINO_DOM_ID}="${domId}"]`;
    if (!escape) return selector;
    return escapeSelector(selector);
}

/** Converts a string into a formatted string like "['a','b','c']" */
export function getArrayString(items: string[]) {
    return `[${items.map((item) => `'${item}'`).join(',')}]`;
}

/** Escapes a CSS selector string so special characters are treated as literals */
export function escapeSelector(selector: string) {
    return CSS.escape(selector);
}

/** Check if a DOM element is valid for the editor - must be a visible element node, not in the ignore list, and not hidden */
export function isValidHTMLElement(element: Element): boolean {
    return (
        element &&
        element instanceof Node &&
        element.nodeType === Node.ELEMENT_NODE &&
        !DOM_IGNORE_TAGS.includes(element.tagName) &&
        !element.hasAttribute(EditorAttributes.DATA_MINO_IGNORE) &&
        (element as HTMLElement).style.display !== 'none'
    );
}

/** Check if any element in the document has an mino id attribute - used to detect if the preload script has processed the page */
export function isMinoInDoc(doc: Document): boolean {
    const attributesExists = doc.evaluate(
        `//*[@${EditorAttributes.DATA_MINO_ID}]`,
        doc,
        null,
        XPathResult.BOOLEAN_TYPE,
        null,
    ).booleanValue;

    return attributesExists;
}
