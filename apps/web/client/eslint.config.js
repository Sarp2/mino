import baseConfig from "@mino/eslint/base";
import nextjsConfig from "@mino/eslint/nextjs";
import reactConfig from "@mino/eslint/react";


/** @type {import('typescript-eslint').Config} */
export default [
    {
        ignores: [".next/**"],
    },
    ...baseConfig,
    ...nextjsConfig,
    ...reactConfig,
];
