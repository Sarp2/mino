import { relations } from 'drizzle-orm';
import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { createUpdateSchema } from 'drizzle-zod';

import { frames } from '../frame/frames';
import { projects } from '../project/project';

export const canvases = pgTable('canvas', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('projectId')
        .notNull()
        .references(() => projects.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }),
}).enableRLS();

export const canvasRelations = relations(canvases, ({ one, many }) => ({
    frames: many(frames),
    // userCanvases: many(userCan),
    project: one(projects, {
        fields: [canvases.projectId],
        references: [projects.id],
    }),
}));

export const canvasUpdateSchema = createUpdateSchema(canvases);

export type Canvas = typeof canvases.$inferSelect;
export type newCanvas = typeof canvases.$inferInsert;
