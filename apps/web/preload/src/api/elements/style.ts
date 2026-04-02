import type { DomElementStyles } from '@mino/models';

import { getHTMLElement } from '../../helpers';

/** Collects all styles from an element from 3 sources: computed (final browser rules), inline (style attribute), and stylesheet (CSS rules). Returns both "defined" styles and "computed" styles */
export function getStyles(element: HTMLElement): DomElementStyles {
    const computed = getElComputedStyle(element);
    const inline = getInlineStyles(element);
    const stylesheet = getStyleSheetStyles(element);

    const defined = {
        width: 'auto',
        height: 'auto',
        ...stylesheet,
        ...inline,
    };

    return { defined, computed };
}

/** Looks up an element by dom id and retuns its computed styles as a key-value map */
export function getComputedStyleByDomId(domId: string): Record<string, string> {
    const element = getHTMLElement(domId);
    if (!element) return {};

    return getElComputedStyle(element);
}

/** Returns the final computed style of an element as a plain object - this is what the browser actually renders (after cascade, inheritance, and defaults) */
function getElComputedStyle(element: HTMLElement): Record<string, string> {
    const computed = window.getComputedStyle(element);
    const styles: Record<string, string> = {};
    for (const prop of computed) {
        styles[prop] = computed.getPropertyValue(prop);
    }
    return styles;
}

/** Read styles set directly on the element via the style attribute (e.g. style="color: red")  */
function getInlineStyles(element: HTMLElement) {
    const styles: Record<string, string> = {};
    const inlineStyles = parseCssText(element.style.cssText);

    Object.entries(inlineStyles).forEach(([prop, value]) => {
        styles[prop] = value;
    });
    return styles;
}

/** Scans all document stylesheets and finds CSS rules that match this element. Uses **element.matches(selectorText)** to test each rule. Returns the matched properties. */
function getStyleSheetStyles(element: HTMLElement) {
    const styles: Record<string, string> = {};
    const sheets = document.styleSheets;

    for (const sheet of sheets) {
        let rules: CSSStyleRule[];
        try {
            if (!sheet) {
                console.warn('Sheet is undefined');
                continue;
            }
            rules =
                (Array.from(sheet.cssRules) as CSSStyleRule[]) || sheet.rules;
        } catch (error) {
            console.warn("Can't read the css rules of: " + sheet?.href, error);
            continue;
        }

        for (const rule of rules) {
            try {
                if (rule && element.matches(rule.selectorText)) {
                    const ruleStyles = parseCssText(rule.style.cssText);
                    Object.entries(ruleStyles).forEach(
                        ([prop, value]) => (styles[prop] = value),
                    );
                }
            } catch (error) {
                console.warn('Error: ', error);
            }
        }
    }
    return styles;
}

/** Parses a CSS text string like "color: red; font-size: 16px" into a key-value object { color: "red", "font-size": "16px" } */
function parseCssText(cssText: string) {
    const styles: Record<string, string> = {};
    cssText.split(';').forEach((style) => {
        style = style.trim();
        if (!style) return;

        const [property, ...values] = style.split(':');
        styles[property?.trim() ?? ''] = values.join(':').trim();
    });
    return styles;
}
