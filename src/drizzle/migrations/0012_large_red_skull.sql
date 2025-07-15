CREATE TYPE "public"."consultation_status" AS ENUM('Pending', 'Completed');--> statement-breakpoint
ALTER TYPE "public"."appointment_status" ADD VALUE 'Completed';--> statement-breakpoint
CREATE TABLE "consultations" (
	"consultation_id" serial PRIMARY KEY NOT NULL,
	"appointment_id" integer NOT NULL,
	"doctor_id" integer NOT NULL,
	"patient_id" integer NOT NULL,
	"symptoms" text,
	"diagnosis" text,
	"treatment_plan" text,
	"additional_notes" text,
	"duration_minutes" integer,
	"status" "consultation_status" DEFAULT 'Completed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "consultations_appointment_id_unique" UNIQUE("appointment_id")
);
--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_appointment_id_appointments_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("appointment_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_doctor_id_doctors_doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("doctor_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patient_id_users_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;