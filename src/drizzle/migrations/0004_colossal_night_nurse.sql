-- 1. Set 'appointment_status' as NOT NULL in the 'appointments' table
ALTER TABLE "appointments"
ALTER COLUMN "appointment_status"
SET NOT NULL;
-- 2. Set 'complaint_status' as NOT NULL in the 'complaints' table
ALTER TABLE "complaints"
ALTER COLUMN "complaint_status"
SET NOT NULL;
-- 3. Set 'payment_status' as NOT NULL in the 'payments' table
ALTER TABLE "payments"
ALTER COLUMN "payment_status"
SET NOT NULL;
-- 4. Add 'available_hours' column of type JSONB to the 'doctors' table with default value '[]' (empty array)
-- Step 1: Change the data type and convert current values into a string array
ALTER TABLE "doctors"
ALTER COLUMN "available_hours"
SET DATA TYPE varchar(255) [] USING string_to_array("available_hours", ',');
-- Assumes available_hours are comma-separated values
-- Step 2: Set default empty array for new rows
ALTER TABLE "doctors"
ALTER COLUMN "available_hours"
SET DEFAULT '{}';