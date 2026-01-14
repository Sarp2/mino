/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */
/** @typedef {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
    singleQuote: true,
    printWidth: 80,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    jsxSingleQuote: false,
    bracketSpacing: true,
    arrowParens: 'always',
    endOfLine: 'lf',

    plugins: [
        '@ianvs/prettier-plugin-sort-imports',
        'prettier-plugin-tailwindcss',
    ],

    tailwindFunctions: ['cn', 'cva'],
    importOrder: [
        '^(react/(.*)$)|^(react$)',
        '^(next/(.*)$)|^(next$)',
        '<THIRD_PARTY_MODULES>',
        '',
        '<TYPES>',
        '<TYPES>^@mino',
        '<TYPES>^[.|..|@]',
        '',
        '^@mino/(.*)$',
        '',
        '^@/',
        '^[../]',
        '^[./]',
    ],
    importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
    importOrderTypeScriptVersion: '4.4.0',
};

export default config;
