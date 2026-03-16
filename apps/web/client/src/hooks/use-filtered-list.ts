import { useMemo } from 'react';

export function useFilteredList<T>(
    items: T[] | undefined,
    search: string,
    matches: (item: T, query: string) => boolean,
    limit: number,
) {
    return useMemo(() => {
        const safeItems = items ?? [];
        const normalized = search.trim().toLowerCase();

        if (normalized.length === 0) {
            return safeItems.slice(0, limit);
        }

        return safeItems
            .filter((item) => matches(item, normalized))
            .slice(0, limit);
    }, [items, search, matches, limit]);
}
