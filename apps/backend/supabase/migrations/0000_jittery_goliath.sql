CREATE TABLE "canvas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "canvas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "frames" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"canvas_id" uuid NOT NULL,
	"branch_id" uuid,
	"url" varchar NOT NULL,
	"x" numeric NOT NULL,
	"y" numeric NOT NULL,
	"width" numeric NOT NULL,
	"height" numeric NOT NULL
);
--> statement-breakpoint
ALTER TABLE "frames" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"git_branch" varchar,
	"git_commit_sha" varchar,
	"git_repo_url" varchar,
	"sandbox_url" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "branches" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"tags" varchar[] DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"preview_img_url" varchar,
	"preview_img_path" varchar,
	"preview_img_bucket" varchar,
	"updated_preview_img_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"first_name" text,
	"last_name" text,
	"display_name" text,
	"avatar_url" text,
	"email" varchar,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"stripe_customer_id" text,
	"github_installation_id" text
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_canvases" (
	"user_id" uuid NOT NULL,
	"canvas_id" uuid NOT NULL,
	"scale" numeric NOT NULL,
	"x" numeric NOT NULL,
	"y" numeric NOT NULL,
	CONSTRAINT "user_canvases_user_id_canvas_id_pk" PRIMARY KEY("user_id","canvas_id")
);
--> statement-breakpoint
ALTER TABLE "user_canvases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_projects" (
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_projects_user_id_project_id_pk" PRIMARY KEY("user_id","project_id")
);
--> statement-breakpoint
ALTER TABLE "user_projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "canvas" ADD CONSTRAINT "canvas_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "frames" ADD CONSTRAINT "frames_canvas_id_canvas_id_fk" FOREIGN KEY ("canvas_id") REFERENCES "public"."canvas"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "frames" ADD CONSTRAINT "frames_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_canvases" ADD CONSTRAINT "user_canvases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_canvases" ADD CONSTRAINT "user_canvases_canvas_id_canvas_id_fk" FOREIGN KEY ("canvas_id") REFERENCES "public"."canvas"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "branches_project_id_idx" ON "branches" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "branches_name_per_project_ux" ON "branches" USING btree ("project_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "branches_default_per_project_ux" ON "branches" USING btree ("project_id") WHERE "branches"."is_default" = true;