ALTER TABLE "payments" ALTER COLUMN "transaction_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "transaction_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "transaction_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_transaction_id_unique" UNIQUE("transaction_id");