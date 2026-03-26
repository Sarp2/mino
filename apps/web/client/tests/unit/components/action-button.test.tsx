import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
} from '@testing-library/react';
import { afterEach, describe, expect, mock, test } from 'bun:test';

import { ActionButton } from '@/app/projects/_components/action-button';

afterEach(() => {
    cleanup();
});

describe('ActionButton', () => {
    test('renders the label when idle', () => {
        render(
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            <ActionButton isCreating={false} label="Open" onClick={() => {}} />,
        );

        expect(screen.getByRole('button', { name: 'Open' })).toBeTruthy();
    });

    test('calls onClick once when enabled', async () => {
        const onClick = mock();
        render(
            <ActionButton isCreating={false} label="Open" onClick={onClick} />,
        );

        await act(() =>
            fireEvent.click(screen.getByRole('button', { name: 'Open' })),
        );

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('disables the button when creating', () => {
        render(
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            <ActionButton isCreating={true} label="Open" onClick={() => {}} />,
        );

        const button = screen.getByRole('button');

        expect((button as HTMLButtonElement).disabled).toBe(true);
    });

    test('renders a spinner instead of the label when creating', () => {
        render(
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            <ActionButton isCreating={true} label="Open" onClick={() => {}} />,
        );

        const button = screen.getByRole('button');

        expect(button.querySelector('svg.animate-spin')).toBeTruthy();
        expect(screen.queryByText('Open')).toBeNull();
    });
});
