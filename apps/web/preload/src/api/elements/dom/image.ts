import { StyleChangeType } from '@mino/models';

import { cssManager } from '../../../api/style';

export function insertImage(domId: string, image: string) {
    cssManager.updateStyle(domId, {
        backgroundImage: {
            value: `url(${image})`,
            type: StyleChangeType.Value,
        },
    });
}

export function removeImage(domId: string) {
    cssManager.updateStyle(domId, {
        backgroundImage: {
            value: `none`,
            type: StyleChangeType.Value,
        },
    });
}
