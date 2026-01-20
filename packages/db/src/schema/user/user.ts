import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

import { userCanvases } from './user-canvas';
import { userProjects } from './user-project';

export const users = pgTable('users', {
    id: uuid().primaryKey(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    displayName: text('display_name'),
    avatarUrl: text('avatar_url'),
    email: varchar('email'),
    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    stripeCustomerId: text('stripe_customer_id'),
    githubInstallationId: text('gihtub_installation_id'),
}).enableRLS();

export const usersRelations = relations(users, ({ many }) => ({
    userCanvas: many(userCanvases),
    userProjects: many(userProjects),
}));

export const userInsertSchema = createInsertSchema(users);

export type User = typeof users.$inferSelect;
export type newUser = typeof users.$inferInsert;
