ALTER TABLE "doctors" ALTER COLUMN "available_hours" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "doctors" ALTER COLUMN "available_hours" SET DEFAULT '[]';