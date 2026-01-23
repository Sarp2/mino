import { relations } from 'drizzle-orm';
import { numeric, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';

import { canvases } from '../canvas/canvas';
import { users } from './user';

export const userCanvases = pgTable(
    'user_canvases',
    {
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        canvasId: uuid('canvas_id')
            .notNull()
            .references(() => canvases.id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        scale: numeric('scale').notNull(),
        x: numeric('x').notNull(),
        y: numeric('y').notNull(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.canvasId] })],
).enableRLS();

export const userCanvasesRelations = relations(userCanvases, ({ one }) => ({
    user: one(users, {
        fields: [userCanvases.userId],
        references: [users.id],
    }),
    canvas: one(canvases, {
        fields: [userCanvases.canvasId],
        references: [canvases.id],
    }),
}));

export const userCanvasInsertSchema = createInsertSchema(userCanvases);
export const userCanvasUpdateSchema = createUpdateSchema(userCanvases);

export type UserCanvas = typeof userCanvases.$inferSelect;
export type newUserCanvas = typeof userCanvases.$inferInsert;
export type NewUserCanvas = typeof userCanvases.$inferInsert;
