import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = fileURLToPath(new URL('../../../', import.meta.url));

export const APP_ROOT = appRoot;
export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
export const AUTH_STATE_PATH = path.join(
    APP_ROOT,
    'playwright/.auth/demo-user.json',
);
