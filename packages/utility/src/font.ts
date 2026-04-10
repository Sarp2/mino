import camelCase from 'lodash/camelCase';

/**
 * Converts a font string like "__Advent_Pro_[hash], __Advent_Pro_Fallback_[hash], sans-serif" to "adventPro"
 */
export function convertFontStrong(fontString: string) {
    if (!fontString) return;

    const firstFont = fontString.split(',')[0]?.trim();
    const cleanFont = firstFont?.replace(/^__/, '').replace(/_[a-f0-9]+$/, '');
    const withoutFallback = cleanFont?.replace(/_Fallback$/, '');

    return camelCase(withoutFallback);
}
