import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'bun:test';

import { useHashParams } from '@/hooks/use-hash-params';

describe('useHashParams', () => {
    beforeEach(() => {
        window.location.hash = '';
    });

    test('returns empty params when no hash is present', async () => {
        const { result } = renderHook(() => useHashParams());

        await act(() => Promise.resolve());

        expect(result.current).toBeInstanceOf(URLSearchParams);
        expect([...result.current!.keys()]).toHaveLength(0);
    });

    test('parses key-value pairs from hash', async () => {
        window.location.hash = '#error_code=403&message=forbidden';
        const { result } = renderHook(() => useHashParams());

        await act(() => Promise.resolve());

        expect(result.current?.get('error_code')).toBe('403');
        expect(result.current?.get('message')).toBe('forbidden');
    });

    test('returns empty params for bare hash', async () => {
        window.location.hash = '#';
        const { result } = renderHook(() => useHashParams());

        await act(() => Promise.resolve());

        expect(result.current).toBeInstanceOf(URLSearchParams);
        expect([...result.current!.keys()]).toHaveLength(0);
    });

    test('handles hash with single param', async () => {
        window.location.hash = '#token=abc123';
        const { result } = renderHook(() => useHashParams());

        await act(() => Promise.resolve());

        expect(result.current?.get('token')).toBe('abc123');
    });
});
