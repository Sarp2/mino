import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { mock } from 'bun:test';

GlobalRegistrator.register();

await mock.module('@mino/db', () => ({
    SEED_USER: {},
}));
