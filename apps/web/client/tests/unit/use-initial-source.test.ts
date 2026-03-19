import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, mock, test } from 'bun:test';

import { useInitialSource } from '@/hooks/use-initial-source.ts';

const mockGetItem = mock();

await mock.module('localforage', () => ({
    default: { getItem: mockGetItem },
}));

const render = (projectCount: number | undefined, isProjectsLoading: boolean) =>
    renderHook(() => useInitialSource({ projectCount, isProjectsLoading }));

describe('useInitialSource', () => {
    beforeEach(() => {
        mockGetItem.mockReset();
    });

    test('is not resolved while projects are loading', () => {
        mockGetItem.mockResolvedValue(null);
        const { result } = render(undefined, true);

        expect(result.current.isResolved).toBe(false);
    });

    test('resolves to projects when projectCount is greater than 0', async () => {
        mockGetItem.mockResolvedValue(null);
        const { result } = render(3, false);

        await act(() => Promise.resolve());

        expect(result.current.source).toBe('projects');
        expect(result.current.isResolved).toBe(true);
    });

    test('resolves to github when provider is github and no projects exist', async () => {
        mockGetItem.mockResolvedValue('github');
        const { result } = render(0, false);

        await act(() => Promise.resolve());

        expect(result.current.source).toBe('github');
    });

    test('resolves to templates when provider is not github and no projects exist', async () => {
        mockGetItem.mockResolvedValue('google');
        const { result } = render(0, false);

        await act(() => Promise.resolve());

        expect(result.current.source).toBe('templates');
    });

    test('falls back to templates when localforage throws', async () => {
        mockGetItem.mockRejectedValue(new Error('storage error'));
        const { result } = render(0, false);

        await act(() => Promise.resolve());

        expect(result.current.source).toBe('templates');
        expect(result.current.isResolved).toBe(true);
    });

    test('setSource updates source correctly', async () => {
        mockGetItem.mockResolvedValue(null);
        const { result } = render(3, false);

        await act(() => Promise.resolve());

        act(() => result.current.setSource('github'));
        expect(result.current.source).toBe('github');
    });
});
