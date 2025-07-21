ALTER TYPE "public"."appointment_status" ADD VALUE 'Failed';--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"message" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now(),
	"read" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "reschedule_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"appointment_id" integer NOT NULL,
	"requested_date" date NOT NULL,
	"requested_time" time NOT NULL,
	"status" varchar(20) DEFAULT 'Pending'
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "is_cash_delivered" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "failure_reason" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "was_rescheduled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reschedule_requests" ADD CONSTRAINT "reschedule_requests_appointment_id_appointments_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("appointment_id") ON DELETE no action ON UPDATE no action;