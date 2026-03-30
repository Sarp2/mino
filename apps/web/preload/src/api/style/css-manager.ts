import { generate, parse, walk } from 'css-tree';

import type { CssNode, Declaration, Raw, Rule } from 'css-tree';
import type { StyleChange } from '@mino/models';

import { EditorAttributes } from '../../constants';
import { getDomIdSelector } from '../../helpers';

/** Singleton that owns the mino **style** element in the document.head. All style edits go through here so they say in one place and can be serialized as a CSS AST via css-tree. */
class CSSManager {
    private static instance: CSSManager;
    private constructor() {
        /* empty */
    }

    /** Creates the mino **style** element with default rules that hide elements being edited and suppress the Next.js portal overlay */
    public injectDefaultStyles() {
        try {
            const styleElement = document.createElement('style');
            styleElement.id = EditorAttributes.MINO_STYLESHEET_ID;

            styleElement.textContent = `
                [${EditorAttributes.DATA_MINO_EDITING_TEXT}="true"] {
                    opacity: 0;
                }
                nextjs-portal {
                    display: none;
                }
            `;
            document.head.appendChild(styleElement);
        } catch (error) {
            console.warn('Error injecting default styless', error);
        }
    }

    public static getInstance(): CSSManager {
        if (!CSSManager.instance) {
            CSSManager.instance = new CSSManager();
        }
        return CSSManager.instance;
    }

    /** Parses the current stylesheet text into a css-tree AST. */
    private get stylesheet(): CssNode {
        const styleElement: HTMLStyleElement = (document.getElementById(
            EditorAttributes.MINO_STYLESHEET_ID,
        ) ?? this.createStylesheet()) as HTMLStyleElement;

        styleElement.textContent = styleElement.textContent ?? '';
        return parse(styleElement.textContent);
    }

    /** Serializes the AST back to text and writes it to the style element. */
    private set stylesheet(ast: CssNode) {
        const styleElement: HTMLStyleElement = (document.getElementById(
            EditorAttributes.MINO_STYLESHEET_ID,
        ) ?? this.createStylesheet()) as HTMLStyleElement;

        styleElement.textContent = generate(ast);
    }

    private createStylesheet(): HTMLStyleElement {
        const styleElement = document.createElement('style');
        styleElement.id = EditorAttributes.MINO_STYLESHEET_ID;

        document.head.appendChild(styleElement);
        return styleElement;
    }

    /** Returns all Rule nodes in the AST whose selector mathces selectorToFind. */
    find(ast: CssNode, selectorToFind: string) {
        const matchingNodes: CssNode[] = [];
        walk(ast, {
            visit: 'Rule',
            enter: (node: CssNode) => {
                if (node.type === 'Rule') {
                    const rule = node;
                    if (rule.prelude.type === 'SelectorList') {
                        rule.prelude.children.forEach((selector) => {
                            const selectorText = generate(selector);
                            if (selectorText === selectorToFind) {
                                matchingNodes.push(node);
                            }
                        });
                    }
                }
            },
        });
        return matchingNodes;
    }

    /** Updates an existing declaration in a rule, adds it it if missing, or removes it if value is empty. */
    public updateStyle(domId: string, style: Record<string, StyleChange>) {
        const selector = getDomIdSelector(domId, false);
        const ast = this.stylesheet;

        for (const [property, value] of Object.entries(style)) {
            const cssProperty = this.jsToCssProperty(property);
            const matchingNodes = this.find(ast, selector);

            if (!matchingNodes.length) {
                this.addRule(ast, selector, cssProperty, value.value);
            } else {
                matchingNodes.forEach((node) => {
                    if (node.type === 'Rule') {
                        this.updateRule(node, cssProperty, value.value);
                    }
                });
            }
        }
        this.stylesheet = ast;
    }

    public removeStyles(domId: string, jsStyles: string[]) {
        const selector = getDomIdSelector(domId, false);
        const ast = this.stylesheet;
        const matchingNodes = this.find(ast, selector);

        matchingNodes.forEach((node) => {
            if (node.type === 'Rule') {
                const cssProperties = jsStyles.map((style) =>
                    this.jsToCssProperty(style),
                );

                node.block.children = node.block.children.filter(
                    (decl: CssNode) =>
                        !cssProperties.includes((decl as Declaration).property),
                );
            }
        });

        this.stylesheet = ast;
    }

    /** Appends a new CSS rule with a single declaration to the stylesheet ACT */
    addRule(ast: CssNode, selector: string, property: string, value: string) {
        const newRule: Rule = {
            type: 'Rule',
            prelude: {
                type: 'SelectorList',
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                children: [
                    {
                        type: 'Selector',
                        children: [
                            {
                                type: 'TypeSelector',
                                name: selector,
                            },
                        ],
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ] as any,
            },
            block: {
                type: 'Block',
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                children: [
                    {
                        type: 'Declaration',
                        property: property,
                        value: { type: 'Raw', value: value },
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ] as any,
            },
        };

        if (ast.type === 'StyleSheet') {
            ast.children.push(newRule);
        }
    }

    updateRule(rule: Rule, property: string, value: string) {
        let found = false;
        walk(rule.block, {
            visit: 'Declaration',
            enter: (decl: Declaration) => {
                if (decl.property === property) {
                    decl.value = { type: 'Raw', value: value };
                    if (value === '') {
                        rule.block.children = rule.block.children.filter(
                            (decl: CssNode) =>
                                (decl as Declaration).property !== property,
                        );
                    }
                    found = true;
                }
            },
        });

        if (!found) {
            if (value === '') {
                rule.block.children = rule.block.children.filter(
                    (decl: CssNode) =>
                        (decl as Declaration).property !== property,
                );
            } else {
                rule.block.children.push({
                    type: 'Declaration',
                    property: property,
                    value: { type: 'Raw', value: value },
                    important: false,
                });
            }
        }
    }

    getJsStyle(selector: string): Record<string, string> {
        const ast = this.stylesheet;
        const matchingNodes = this.find(ast, selector);

        const styles: Record<string, string> = {};
        if (!matchingNodes.length) return styles;

        matchingNodes.forEach((node) => {
            if (node.type === 'Rule') {
                walk(node, {
                    visit: 'Declaration',
                    enter: (decl: Declaration) => {
                        styles[this.cssToJsProperty(decl.property)] = (
                            decl.value as Raw
                        ).value;
                    },
                });
            }
        });
        return styles;
    }

    jsToCssProperty(key: string) {
        if (!key) return '';
        return key.replace(/([A-Z])/g, '-$1').toLowerCase();
    }

    cssToJsProperty(key: string) {
        if (!key) return '';
        return key.replace(/-([a-z])/g, (g) => g[1]?.toUpperCase() ?? '');
    }

    clear() {
        this.stylesheet = parse('');
    }
}

export const cssManager = CSSManager.getInstance();
