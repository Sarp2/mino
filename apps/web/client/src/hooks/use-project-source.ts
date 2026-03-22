import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { SourceType } from '@/types';

import { Source, SOURCE_SEARCH_PARAM_KEY } from '@/utils/constants';

interface UseProjectSourceOptions {
    forcedSource?: SourceType;
}

interface UseProjectSourceResult {
    source: SourceType;
    isResolved: true;
    changeSource: (nextSource: SourceType) => void;
}

export function useProjectSource({
    forcedSource,
}: UseProjectSourceOptions): UseProjectSourceResult {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const source = forcedSource ?? Source.PROJECTS;

    const changeSource = (nextSource: SourceType) => {
        const next = new URLSearchParams(searchParams.toString());

        if (nextSource === Source.PROJECTS) {
            next.delete(SOURCE_SEARCH_PARAM_KEY);
        } else {
            next.set(SOURCE_SEARCH_PARAM_KEY, nextSource);
        }

        const query = next.toString();
        router.replace(query ? `${pathname}?${query}` : pathname);
    };

    return { source, isResolved: true, changeSource };
}
