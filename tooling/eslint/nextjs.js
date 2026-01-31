import nextPlugin from '@next/eslint-plugin-next';
import onlyWarn from 'eslint-plugin-only-warn';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    { ignores: ['**/env.ts', '**/.env', '**/next-env.d.ts'] },
    {
        files: ['**/*.js', '**/*.ts', '**/*.tsx'],
        rules: {
            'no-restricted-properties': [
                'error',
                {
                    object: 'process',
                    property: 'env',
                    message:
                        "Use `import { env } from '@/env'` instead to ensure validated types.",
                },
            ],
            'no-restricted-imports': [
                'error',
                {
                    name: 'process',
                    importNames: ['env'],
                    message:
                        "Use `import { env } from '@/env'` instead to ensure validated types.",
                },
            ],
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        plugins: {
            '@next/next': nextPlugin,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            onlyWarn,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
        },
    },
]);
