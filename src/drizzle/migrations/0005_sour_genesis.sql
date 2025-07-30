ALTER TABLE "doctors" ALTER COLUMN "available_hours" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "doctors" ALTER COLUMN "available_hours" SET DEFAULT '{}';