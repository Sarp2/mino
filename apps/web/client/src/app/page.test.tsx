import { describe, expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';

const Home = (await import('./page')).default;

describe('Home page', () => {
    it('renders Hello message', async () => {
        // Home is an async component, so we need to await it
        const Component = await Home();
        render(Component);

        expect(screen.getByText('Hello')).toBeDefined();
    });

    it('renders a div element', async () => {
        const Component = await Home();
        const { container } = render(Component);

        const div = container.querySelector('div');
        expect(div).toBeDefined();
        expect(div?.textContent).toBe('Hello');
    });

    it('is a default export', () => {
        expect(Home).toBeDefined();
        expect(typeof Home).toBe('function');
    });

    it('is an async server component', async () => {
        const result = Home();
        expect(result).toBeInstanceOf(Promise);

        const Component = await result;
        expect(Component).toBeDefined();
    });

    it('renders simple greeting text', async () => {
        const Component = await Home();
        const { container } = render(Component);

        expect(container.textContent).toContain('Hello');
    });
});