import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, mock, test } from 'bun:test';

import { useProjectSource } from '@/hooks/use-project-source';
import { Source } from '@/utils/constants';

const mockReplace = mock();
const mockToString = mock();

await mock.module('next/navigation', () => ({
    useRouter: () => ({ replace: mockReplace }),
    usePathname: () => '/projects',
    useSearchParams: () => ({ toString: mockToString }),
}));

describe('useProjectSource', () => {
    beforeEach(() => {
        mockReplace.mockReset();
        mockToString.mockReset();
        mockToString.mockReturnValue('');
    });

    test('defaults to projects source and is always resolved', () => {
        const { result } = renderHook(() => useProjectSource({}));

        expect(result.current.source).toBe(Source.PROJECTS);
        expect(result.current.isResolved).toBe(true);
    });

    test('uses forced source when provided', () => {
        const { result } = renderHook(() =>
            useProjectSource({ forcedSource: Source.GITHUB }),
        );

        expect(result.current.source).toBe(Source.GITHUB);
    });

    test('changeSource sets query param for non-project sources', () => {
        const { result } = renderHook(() => useProjectSource({}));

        act(() => result.current.changeSource(Source.TEMPLATES));

        expect(mockReplace).toHaveBeenCalledWith('/projects?source=templates');
    });

    test('changeSource removes query param when switching to projects', () => {
        mockToString.mockReturnValue('source=github');
        const { result } = renderHook(() => useProjectSource({}));

        act(() => result.current.changeSource(Source.PROJECTS));

        expect(mockReplace).toHaveBeenCalledWith('/projects');
    });

    test('changeSource preserves existing query params', () => {
        mockToString.mockReturnValue('foo=bar');
        const { result } = renderHook(() => useProjectSource({}));

        act(() => result.current.changeSource(Source.GITHUB));

        expect(mockReplace).toHaveBeenCalledWith(
            '/projects?foo=bar&source=github',
        );
    });
});
