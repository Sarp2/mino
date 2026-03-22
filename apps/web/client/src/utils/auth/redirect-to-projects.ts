import type { SourceType } from '@/types';

import { Routes, Source, SOURCE_SEARCH_PARAM_KEY } from '@/utils/constants';

export const redirectToProjects = (origin: string, source?: SourceType) => {
    const url = new URL(`${origin}${Routes.PROJECTS}`);
    if (source === Source.GITHUB || source === Source.TEMPLATES) {
        url.searchParams.set(SOURCE_SEARCH_PARAM_KEY, source);
    }
    return url.toString();
};
