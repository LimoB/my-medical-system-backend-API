ALTER TABLE "consultations" RENAME COLUMN "status" TO "observation";--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "prescription" text;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "reference_code" varchar(50);--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "consultation_date" date;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "consultation_status" "consultation_status" DEFAULT 'Completed' NOT NULL;