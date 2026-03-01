import { v4 as uuidv4 } from 'uuid';

import type { Canvas } from '../schema';

export const createDefaultCanvas = (projectId: string): Canvas => {
    return {
        id: uuidv4(),
        projectId: projectId,
    };
};
