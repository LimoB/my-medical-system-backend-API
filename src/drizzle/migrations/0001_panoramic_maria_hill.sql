ALTER TABLE "doctors" RENAME COLUMN "first_name" TO "user_id";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "firstname" TO "first_name";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "lastname" TO "last_name";--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "doctors" DROP COLUMN "contact_phone";--> statement-breakpoint
ALTER TABLE "doctors" DROP COLUMN "image_url";--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_unique" UNIQUE("user_id");