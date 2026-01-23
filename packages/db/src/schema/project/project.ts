import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import z from 'zod';

import { canvases } from '../canvas/canvas';
import { branches, PROJECT_BRANCH_RELATION_NAME } from './branch';

export const projects = pgTable('projects', {
    id: uuid('id').primaryKey().defaultRandom(),

    // metadata
    name: varchar('text').notNull(),
    name: varchar('name').notNull(),
    description: text('description'),
    tags: varchar('tags').array().default([]),
    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .notNull(),

    // preview image
    previewImgUrl: varchar('preview_img_url'),
    previewImgPath: varchar('preview_img_path'),
    previewImgBucket: varchar('preview_img_bucket'),
    updatedPreviewImgAt: timestamp('updated_preview_img_at', {
        withTimezone: true,
    }),
}).enableRLS();

export const projectRelations = relations(projects, ({ one, many }) => ({
    canvas: one(canvases, {
        fields: [projects.id],
        references: [canvases.projectId],
    }),
    branches: many(branches, {
        relationName: PROJECT_BRANCH_RELATION_NAME,
    }),
}));

export const projectInsertSchema = createInsertSchema(projects);
export const projectUpdateSchema = createUpdateSchema(projects, {
    id: z.uuid(),
});

export type Project = typeof projects.$inferSelect;
export type newProject = typeof projects.$inferInsert;
