export enum EditorAttributes {
    DATA_MINO_IGNORE = 'data-mino-ignore',
    DATA_MINO_DRAG_SAVED_STYLE = 'data-mino-drag-saved-style',
    MINO_STUB_ID = 'mino-drag-stub',
    DATA_MINO_INSERTED = 'data-mino-inserted',
    DATA_MINO_EDITING_TEXT = 'data-mino-editing-text',
    MINO_STYLESHEET_ID = 'mino-stylesheet',
    DATA_MINO_DRAG_START_POSITION = 'data-mino-drag-start-position',
    DATA_MINO_DRAGGING = 'data-mino-dragging',
    DATA_MINO_DRAG_DIRECTION = 'data-mino-drag-direction',

    // Ids
    DATA_MINO_ID = 'data-oid',
    DATA_MINO_INSTANCE_ID = 'data-oiid',
    DATA_MINO_DOM_ID = 'data-odid',
    DATA_MINO_COMPONENT_NAME = 'data-ocname',
}

export const DOM_IGNORE_TAGS = ['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT'];

export enum SystemTheme {
    LIGHT = 'light',
    DARK = 'dark',
    SYSTEM = 'system',
}
