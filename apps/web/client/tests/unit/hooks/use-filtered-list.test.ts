import { renderHook } from '@testing-library/react';
import { describe, expect, mock, test } from 'bun:test';

import { useFilteredList } from '@/hooks/use-filtered-list';

describe('useFilteredList', () => {
    test('returns an empty array when items are undefined', () => {
        const matches = mock(() => true);

        const { result } = renderHook(() =>
            useFilteredList(undefined, 'test', matches, 5),
        );

        expect(result.current).toEqual([]);
    });

    test('trims and lowercases the search query before matching', () => {
        const matches = mock((item: { name: string }, query: string) =>
            item.name.includes(query),
        );

        renderHook(() =>
            useFilteredList([{ name: 'alpha' }], '  ALPHA  ', matches, 5),
        );

        expect(matches).toHaveBeenCalledWith({ name: 'alpha' }, 'alpha');
    });

    test('returns the first limited items when search is blank and does not call matches', () => {
        const matches = mock(() => true);
        const items = [{ id: 1 }, { id: 2 }, { id: 3 }];

        const { result } = renderHook(() =>
            useFilteredList(items, '   ', matches, 2),
        );

        expect(result.current).toEqual([{ id: 1 }, { id: 2 }]);
        expect(matches).not.toHaveBeenCalled();
    });

    test('filters items before applying the limit', () => {
        const matches = mock((item: { name: string }, query: string) =>
            item.name.toLowerCase().includes(query),
        );
        const items = [
            { name: 'alpha-1' },
            { name: 'beta' },
            { name: 'alpha-2' },
            { name: 'alpha-3' },
        ];

        const { result } = renderHook(() =>
            useFilteredList(items, 'ALPHA', matches, 2),
        );

        expect(result.current).toEqual([
            { name: 'alpha-1' },
            { name: 'alpha-2' },
        ]);
    });

    test('returns an empty array when no items match', () => {
        const matches = mock(() => false);

        const { result } = renderHook(() =>
            useFilteredList([{ id: 1 }], 'missing', matches, 5),
        );

        expect(result.current).toEqual([]);
    });
});
