-- AlterTable
ALTER TABLE "users"
ADD COLUMN "password_hash" VARCHAR(255);

-- Normalize uniqueness for case-insensitive credential lookup.
CREATE UNIQUE INDEX "users_email_normalized_key" ON "users" (LOWER("email"));
