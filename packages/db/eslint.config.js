import baseConfig from "@mino/eslint/base";

/** @type {import('typescript-eslint').Config} */
export default [
    {
        ignores: ["dist/**", "build/**", "drizzle/**"],
    },
    ...baseConfig,
]
