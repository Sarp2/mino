import { useEffect, useState } from 'react';
import localforage from 'localforage';

import type { SourceType } from '@/types';

import { PROVIDER_STORAGE_KEY } from '@/utils/constants';

interface UseInitialSourceOptions {
    projectCount: number | undefined;
    isProjectsLoading: boolean;
}

interface UseInitialSourceResult {
    source: SourceType;
    setSource: (source: SourceType) => void;
    isResolved: boolean;
}

async function readStoredProvider(): Promise<string | null> {
    try {
        const stored = await localforage.getItem<string>(PROVIDER_STORAGE_KEY);
        return typeof stored === 'string' ? stored : null;
    } catch {
        return null;
    }
}

function deriveInitialSource(
    provider: string | null,
    projectCount: number,
): SourceType {
    if (projectCount > 0) return 'projects';
    return provider === 'github' ? 'github' : 'templates';
}

export function useInitialSource({
    projectCount,
    isProjectsLoading,
}: UseInitialSourceOptions): UseInitialSourceResult {
    const [source, setSource] = useState<SourceType>('projects');
    const [isResolved, setIsResolved] = useState(false);

    useEffect(() => {
        if (isProjectsLoading) return;

        let cancelled = false;

        const resolve = async () => {
            const provider = await readStoredProvider();
            if (cancelled) return;

            setSource(deriveInitialSource(provider, projectCount ?? 0));
            setIsResolved(true);
        };

        void resolve();

        return () => {
            cancelled = true;
        };
    }, [isProjectsLoading, projectCount]);

    return { source, setSource, isResolved };
}
