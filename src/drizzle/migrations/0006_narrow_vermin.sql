ALTER TABLE "doctors" ALTER COLUMN "available_days" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "doctors" ALTER COLUMN "available_days" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doctors" ALTER COLUMN "available_hours" SET DATA TYPE varchar(255)[];--> statement-breakpoint
ALTER TABLE "doctors" ALTER COLUMN "available_hours" SET DEFAULT '{}';