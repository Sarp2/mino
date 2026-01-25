import { relations } from 'drizzle-orm';
import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';

import { frames } from '../frame/frames';
import { projects } from '../project/project';
import { userCanvases } from '../user/user-canvas';

export const canvases = pgTable('canvas', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
        .notNull()
        .references(() => projects.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }),
}).enableRLS();

export const canvasRelations = relations(canvases, ({ one, many }) => ({
    frames: many(frames),
    userCanvases: many(userCanvases),
    project: one(projects, {
        fields: [canvases.projectId],
        references: [projects.id],
    }),
}));

export const canvasUpdateSchema = createUpdateSchema(canvases);
export const canvasInsertSchema = createInsertSchema(canvases);

export type Canvas = typeof canvases.$inferSelect;
export type NewCanvas = typeof canvases.$inferInsert;
