CREATE TYPE "public"."consultation_type" AS ENUM('initial', 'follow-up', 'review');--> statement-breakpoint
ALTER TABLE "consultations" DROP CONSTRAINT "consultations_appointment_id_unique";--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "consultation_type" "consultation_type" DEFAULT 'initial' NOT NULL;