import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { ClassValue } from 'clsx';

/**
 * Compose and resolve Tailwind CSS class names into a single optimized string.
 *
 * Accepts one or more clsx-compatible values (strings, objects, arrays, etc.), normalizes and concatenates them, and resolves Tailwind CSS class conflicts so the resulting string contains the intended utility classes.
 *
 * @param inputs - One or more clsx-compatible values representing class names or conditional class mappings
 * @returns A single className string with merged Tailwind CSS classes and resolved conflicts
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}