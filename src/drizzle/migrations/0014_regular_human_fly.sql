CREATE TABLE "doctor_meeting_attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" integer NOT NULL,
	"meeting_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'Pending',
	"attended" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "doctor_meeting_attendance_doctor_id_meeting_id_unique" UNIQUE("doctor_id","meeting_id")
);
--> statement-breakpoint
CREATE TABLE "doctor_meetings" (
	"meeting_id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"meeting_date" date NOT NULL,
	"meeting_time" time NOT NULL,
	"is_global" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "date_of_birth" date;--> statement-breakpoint
ALTER TABLE "doctor_meeting_attendance" ADD CONSTRAINT "doctor_meeting_attendance_doctor_id_doctors_doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("doctor_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_meeting_attendance" ADD CONSTRAINT "doctor_meeting_attendance_meeting_id_doctor_meetings_meeting_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."doctor_meetings"("meeting_id") ON DELETE no action ON UPDATE no action;