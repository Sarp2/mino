export interface BaseDomElement {
    domId: string;
    frameId: string;
    branchId: string;
    oid: string | null;
    instanceId: string | null;
    rect: DOMRect;
}

export type ParentDomElement = BaseDomElement;

export interface DomElement extends BaseDomElement {
    tagName: string;
    styles: DomElementStyles | null;
    parent: ParentDomElement | null;
}

export interface DomElementStyles {
    defined: Record<string, string>; // Styles from stylesheets or inline
    computed: Record<string, string>; // Browser computed styles
}
