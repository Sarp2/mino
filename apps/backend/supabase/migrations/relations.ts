import { relations } from "drizzle-orm/relations";
import { projects, canvas, frames } from "./schema";

export const canvasRelations = relations(canvas, ({one, many}) => ({
	project: one(projects, {
		fields: [canvas.projectId],
		references: [projects.id]
	}),
	frames: many(frames),
}));

export const projectsRelations = relations(projects, ({many}) => ({
	canvas: many(canvas),
}));

export const framesRelations = relations(frames, ({one}) => ({
	canva: one(canvas, {
		fields: [frames.canvasId],
		references: [canvas.id]
	}),
}));