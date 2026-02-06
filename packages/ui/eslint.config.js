import baseConfig from '@mino/eslint/base';
import reactConfig from '@mino/eslint/react';

/** @type {import('typescript-eslint').Config} */
export default [
    ...baseConfig,
    ...reactConfig,
];
