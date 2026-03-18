import { and, eq } from 'drizzle-orm';

import type { DrizzleDb } from '@mino/db';

import { branches, projects, users } from '@mino/db';

type DbOrTx = Pick<DrizzleDb, 'query'>;

export const verifyBranchAccess = async (
    db: DbOrTx,
    userId: string,
    branchId: string,
): Promise<boolean> => {
    const branch = await db.query.branches.findFirst({
        where: and(eq(branches.id, branchId), eq(users.id, userId)),
    });

    if (!branch) {
        return false;
    }

    return true;
};

export const verifyProjectAccess = async (
    db: DbOrTx,
    userId: string,
    projectId: string,
): Promise<boolean> => {
    const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
    });

    return !!project;
};
