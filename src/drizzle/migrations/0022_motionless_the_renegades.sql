ALTER TYPE "public"."payment_status" ADD VALUE 'CashOnDelivery';--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "payment_status" "payment_status" DEFAULT 'Pending' NOT NULL;