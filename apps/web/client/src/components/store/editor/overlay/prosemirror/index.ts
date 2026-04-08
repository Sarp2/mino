import { baseKeymap } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { Schema } from 'prosemirror-model';

import type { EditorState, Plugin } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

import { isColorEmpty } from '@mino/utility';

import { ensureFontLoaded } from '@/hooks/use-font-loader';
import { adaptValueToCanvas } from '../utils';

/** ProseMirror schema: doc → paragraphs → text/hard_break, with a style mark for inline CSS. */
export const schema = new Schema({
    nodes: {
        doc: { content: 'paragraph+' },
        paragraph: {
            content: '(text | hard_break)*',
            toDom: () => ['p', { style: 'margin: 0; padding: 0; ' }],
        },
        text: { inline: true },
        hard_break: {
            inline: true,
            group: 'inline',
            selectable: false,
            toDOM: () => ['br'],
        },
    },
    marks: {
        style: {
            attrs: { style: { default: null } },
            parseDOM: [
                {
                    tag: 'span[style]',
                    getAttrs: (node) => ({
                        style: node.getAttribute('style'),
                    }),
                },
            ],
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            toDOM: (mark) => ['span', { style: mark.attrs.style }, 0],
        },
    },
});

/** Applies the original element's computed styles (font, color, size, etc.)
 *  to the ProseMirror editor so it visually matches the element being edited. */
export function applyStyleToEditor(
    editorView: EditorView,
    styles: Record<string, string>,
) {
    const { state, dispatch } = editorView;
    const styleMark = state.schema.marks?.style;
    if (!styleMark) {
        console.error('No style mark found');
        return;
    }

    const tr = state.tr.addMark(
        0,
        state.doc.content.size,
        styleMark.create({ style: styles }),
    );

    const fontSize = adaptValueToCanvas(parseFloat(styles.fontSize ?? ''));
    const lineHeight = adaptValueToCanvas(parseFloat(styles.lineHeight ?? ''));
    const fontFamily = ensureFontLoaded(styles.fontFamily ?? '');

    Object.assign(editorView.dom.style, {
        fontSize: `${fontSize}px`,
        lineHeight: `${lineHeight}px`,
        fontWeight: styles.fontWeight,
        fontStyle: styles.fontStyle,
        color: isColorEmpty(styles.color ?? '') ? 'inherit' : styles.color,
        textAlign: styles.textAlign,
        textDecoration: styles.textDecoration,
        letterSpacing: styles.letterSpacing,
        wordSpacing: styles.wordSpacing,
        alignItems: styles.alignItems,
        justifyContent: styles.justifyContent,
        layout: styles.layout,
        display: styles.display,
        backgroundColor: styles.backgroundColor,
        wordBreak: 'break-word',
        overflow: 'visible',
        height: '100%',
        fontFamily,
        padding: styles.padding,
    });
    dispatch(tr);
}

/** Inserts a <br /> (hard break) into the editor on Shift-Enter. */
const createLineBreakHandler = (
    state: EditorState,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatch?: (tr: any) => void,
) => {
    if (dispatch) {
        const hardBreakNode = state.schema.nodes.hard_break;
        if (hardBreakNode) {
            dispatch(state.tr.replaceSelectionWith(hardBreakNode.create()));
        }
    }
    return true;
};

/** Exits text editing mode on Enter. */
const createEnterHandler = (onExist: () => void) => (_state: EditorState) => {
    onExist();
    return true;
};

/** Sets up keyboard shortcuts: undo/redo, Espace to exit, Enter to confirm, Shift-Enter for line */
export const createEditorPlugins = (
    onEscape?: () => void,
    onEnter?: () => void,
): Plugin[] => [
    history(),
    keymap({
        'Mod-z': undo,
        'Mod-shift-z': redo,
        Escape: () => {
            onEscape?.();
            return !!onEscape;
        },
        Enter: onEnter ? createEnterHandler(onEnter) : () => false,
        'Shift-Enter': createLineBreakHandler,
    }),
    keymap(baseKeymap),
];
