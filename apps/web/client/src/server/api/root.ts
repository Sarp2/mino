import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc';
import { branchRouter } from './routers/project/branch';
import { githubRouter } from './routers/project/github';
import { projectRouter } from './routers/project/project';
import { sandboxRouter } from './routers/project/sandbox';
import { userRouter } from './routers/user/user';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    user: userRouter,
    project: projectRouter,
    branch: branchRouter,
    sandbox: sandboxRouter,
    github: githubRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
