CREATE TYPE "public"."payment_method" AS ENUM('stripe', 'mpesa', 'paypal', 'cash');--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "payment_method" "payment_method" NOT NULL;