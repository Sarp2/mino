import { SystemTheme } from '../../constants';

/** Returns the current theme from localStorage, defaults to light. */
export function getTheme(): SystemTheme {
    try {
        const stored = window?.localStorage.getItem('theme');
        if (
            stored === SystemTheme.LIGHT ||
            stored === SystemTheme.DARK ||
            stored === SystemTheme.SYSTEM
        ) {
            return stored;
        }
        return SystemTheme.LIGHT;
    } catch (error) {
        console.warn('Failed to get theme', error);
        return SystemTheme.LIGHT;
    }
}

/** Applies the theme by toggling the 'dark' class on documentElement and persisting the value to localStorage. */
export function setTheme(theme: SystemTheme) {
    try {
        if (theme === SystemTheme.DARK) {
            document.documentElement.classList.add('dark');
            window?.localStorage.setItem('theme', SystemTheme.DARK);
        } else if (theme === SystemTheme.LIGHT) {
            document.documentElement.classList.remove('dark');
            window?.localStorage.setItem('theme', SystemTheme.LIGHT);
        } else if (theme === SystemTheme.SYSTEM) {
            const isDarkMode = window.matchMedia(
                '(prefers-color-scheme: dark)',
            ).matches;
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            window?.localStorage.setItem('theme', SystemTheme.SYSTEM);
        }
        return true;
    } catch (error) {
        console.warn('Failed to set theme: ', error);
        return false;
    }
}
