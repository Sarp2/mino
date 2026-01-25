import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';

import { userCanvases } from './user-canvas';
import { userProjects } from './user-project';

export const users = pgTable('users', {
    id: uuid('id').primaryKey().notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    displayName: text('display_name'),
    avatarUrl: text('avatar_url'),
    email: varchar('email'),
    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    stripeCustomerId: text('stripe_customer_id'),
    githubInstallationId: text('github_installation_id'),
}).enableRLS();

export const usersRelations = relations(users, ({ many }) => ({
    userCanvas: many(userCanvases),
    userProjects: many(userProjects),
}));

export const userInsertSchema = createInsertSchema(users);
export const userUpdateSchema = createUpdateSchema(users);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
