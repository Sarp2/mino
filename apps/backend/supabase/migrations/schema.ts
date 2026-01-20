import { pgTable, foreignKey, uuid, varchar, numeric, text, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const canvas = pgTable("canvas", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "canvas_projectId_projects_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const frames = pgTable("frames", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	canvasId: uuid().notNull(),
	branchId: uuid("branch_id"),
	url: varchar().notNull(),
	x: numeric().notNull(),
	y: numeric().notNull(),
	width: numeric().notNull(),
	height: numeric().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.canvasId],
			foreignColumns: [canvas.id],
			name: "frames_canvasId_canvas_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const projects = pgTable("projects", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	text: varchar().notNull(),
	description: text(),
	tags: varchar().array().default([""]),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	previewImgUrl: varchar("preview_img_url"),
	previewImgPath: varchar("preview_img_path"),
	previewImgBucket: varchar("preview_img_bucket"),
	updatedPreviewImgAt: timestamp("updated_preview_img_at", { withTimezone: true, mode: 'string' }),
});

export const users = pgTable("users", {
	id: uuid().primaryKey().notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	displayName: text("display_name"),
	avatarUrl: text("avatar_url"),
	email: varchar(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	gihtubInstallationId: text("gihtub_installation_id"),
});
