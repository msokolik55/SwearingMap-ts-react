-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "plpgsql";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis_tiger_geocoder";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis_topology";

-- CreateEnum
CREATE TYPE "RoleKey" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ModerationAction" AS ENUM ('APPROVE', 'REJECT', 'REQUEST_CHANGES', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "QuizQuestionType" AS ENUM ('MEANING_TO_WORD', 'WORD_TO_MEANING');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SUBMISSION_STATUS', 'NEW_LANGUAGE_CONTENT', 'PRODUCT_UPDATE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "display_name" VARCHAR(120),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "key" "RoleKey" NOT NULL,
    "description" VARCHAR(255) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role_key" "RoleKey" NOT NULL,
    "assigned_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_key")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" UUID NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "native_name" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" UUID NOT NULL,
    "iso2" CHAR(2) NOT NULL,
    "iso3" CHAR(3) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "map_center" geography(Point,4326),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country_languages" (
    "country_id" UUID NOT NULL,
    "language_id" UUID NOT NULL,
    "primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "country_languages_pkey" PRIMARY KEY ("country_id","language_id")
);

-- CreateTable
CREATE TABLE "swear_words" (
    "id" UUID NOT NULL,
    "language_id" UUID NOT NULL,
    "country_id" UUID,
    "submitted_by_id" UUID,
    "term" VARCHAR(160) NOT NULL,
    "normalized_term" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "editorial_intensity" SMALLINT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "swear_words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meanings" (
    "id" UUID NOT NULL,
    "swear_word_id" UUID NOT NULL,
    "definition" TEXT NOT NULL,
    "locale" VARCHAR(10) NOT NULL DEFAULT 'en',
    "position" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "meanings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_examples" (
    "id" UUID NOT NULL,
    "swear_word_id" UUID NOT NULL,
    "example" TEXT NOT NULL,
    "translation" TEXT,
    "locale" VARCHAR(10) NOT NULL DEFAULT 'en',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sources" (
    "id" UUID NOT NULL,
    "swear_word_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "url" VARCHAR(2048),
    "citation" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translation_equivalents" (
    "id" UUID NOT NULL,
    "source_word_id" UUID NOT NULL,
    "target_word_id" UUID NOT NULL,
    "confidence" DOUBLE PRECISION,
    "notes" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "translation_equivalents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intensity_ratings" (
    "user_id" UUID NOT NULL,
    "swear_word_id" UUID NOT NULL,
    "value" SMALLINT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "intensity_ratings_pkey" PRIMARY KEY ("user_id","swear_word_id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" UUID NOT NULL,
    "submitter_id" UUID NOT NULL,
    "language_id" UUID NOT NULL,
    "country_id" UUID,
    "proposed_term" VARCHAR(160) NOT NULL,
    "proposed_definition" TEXT NOT NULL,
    "proposed_intensity" SMALLINT NOT NULL,
    "contextual_notes" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_decisions" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "moderator_id" UUID NOT NULL,
    "action" "ModerationAction" NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "language_id" UUID NOT NULL,
    "score" SMALLINT,
    "question_count" SMALLINT NOT NULL,
    "completed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "swear_word_id" UUID NOT NULL,
    "type" "QuizQuestionType" NOT NULL,
    "selected_answer" TEXT,
    "correct" BOOLEAN,
    "position" SMALLINT NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "body" TEXT NOT NULL,
    "payload" JSONB,
    "read_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "language_id" UUID,
    "in_app" BOOLEAN NOT NULL DEFAULT true,
    "push" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_expires_at_idx" ON "sessions"("user_id", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso2_key" ON "countries"("iso2");

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso3_key" ON "countries"("iso3");

-- CreateIndex
CREATE UNIQUE INDEX "countries_slug_key" ON "countries"("slug");

-- CreateIndex
CREATE INDEX "swear_words_status_language_id_idx" ON "swear_words"("status", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "swear_words_language_id_country_id_normalized_term_key" ON "swear_words"("language_id", "country_id", "normalized_term");

-- CreateIndex
CREATE UNIQUE INDEX "swear_words_language_id_slug_key" ON "swear_words"("language_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "meanings_swear_word_id_locale_position_key" ON "meanings"("swear_word_id", "locale", "position");

-- CreateIndex
CREATE INDEX "usage_examples_swear_word_id_idx" ON "usage_examples"("swear_word_id");

-- CreateIndex
CREATE INDEX "sources_swear_word_id_idx" ON "sources"("swear_word_id");

-- CreateIndex
CREATE INDEX "translation_equivalents_target_word_id_status_idx" ON "translation_equivalents"("target_word_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "translation_equivalents_source_word_id_target_word_id_key" ON "translation_equivalents"("source_word_id", "target_word_id");

-- CreateIndex
CREATE INDEX "intensity_ratings_swear_word_id_idx" ON "intensity_ratings"("swear_word_id");

-- CreateIndex
CREATE INDEX "submissions_status_submitted_at_idx" ON "submissions"("status", "submitted_at");

-- CreateIndex
CREATE INDEX "submissions_submitter_id_created_at_idx" ON "submissions"("submitter_id", "created_at");

-- CreateIndex
CREATE INDEX "moderation_decisions_submission_id_created_at_idx" ON "moderation_decisions"("submission_id", "created_at");

-- CreateIndex
CREATE INDEX "quiz_attempts_user_id_created_at_idx" ON "quiz_attempts"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_questions_attempt_id_position_key" ON "quiz_questions"("attempt_id", "position");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_read_at_created_at_idx" ON "notifications"("recipient_id", "read_at", "created_at");

-- CreateIndex
CREATE INDEX "notification_preferences_language_id_idx" ON "notification_preferences"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_type_language_id_key" ON "notification_preferences"("user_id", "type", "language_id");

-- PostgreSQL treats NULLs as distinct in regular unique indexes. This partial
-- index keeps a single language-agnostic preference per user and event type.
CREATE UNIQUE INDEX "notification_preferences_user_id_type_default_key" ON "notification_preferences"("user_id", "type") WHERE "language_id" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_key_fkey" FOREIGN KEY ("role_key") REFERENCES "roles"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "country_languages" ADD CONSTRAINT "country_languages_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "country_languages" ADD CONSTRAINT "country_languages_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swear_words" ADD CONSTRAINT "swear_words_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swear_words" ADD CONSTRAINT "swear_words_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swear_words" ADD CONSTRAINT "swear_words_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meanings" ADD CONSTRAINT "meanings_swear_word_id_fkey" FOREIGN KEY ("swear_word_id") REFERENCES "swear_words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_examples" ADD CONSTRAINT "usage_examples_swear_word_id_fkey" FOREIGN KEY ("swear_word_id") REFERENCES "swear_words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_swear_word_id_fkey" FOREIGN KEY ("swear_word_id") REFERENCES "swear_words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translation_equivalents" ADD CONSTRAINT "translation_equivalents_source_word_id_fkey" FOREIGN KEY ("source_word_id") REFERENCES "swear_words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translation_equivalents" ADD CONSTRAINT "translation_equivalents_target_word_id_fkey" FOREIGN KEY ("target_word_id") REFERENCES "swear_words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intensity_ratings" ADD CONSTRAINT "intensity_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intensity_ratings" ADD CONSTRAINT "intensity_ratings_swear_word_id_fkey" FOREIGN KEY ("swear_word_id") REFERENCES "swear_words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_decisions" ADD CONSTRAINT "moderation_decisions_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_decisions" ADD CONSTRAINT "moderation_decisions_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_swear_word_id_fkey" FOREIGN KEY ("swear_word_id") REFERENCES "swear_words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Domain invariants that Prisma cannot express in the schema.
ALTER TABLE "swear_words" ADD CONSTRAINT "swear_words_editorial_intensity_check"
  CHECK ("editorial_intensity" IS NULL OR "editorial_intensity" BETWEEN 1 AND 5);

ALTER TABLE "intensity_ratings" ADD CONSTRAINT "intensity_ratings_value_check"
  CHECK ("value" BETWEEN 1 AND 5);

ALTER TABLE "submissions" ADD CONSTRAINT "submissions_proposed_intensity_check"
  CHECK ("proposed_intensity" BETWEEN 1 AND 5);

ALTER TABLE "translation_equivalents" ADD CONSTRAINT "translation_equivalents_distinct_words_check"
  CHECK ("source_word_id" <> "target_word_id");

ALTER TABLE "translation_equivalents" ADD CONSTRAINT "translation_equivalents_confidence_check"
  CHECK ("confidence" IS NULL OR "confidence" BETWEEN 0 AND 1);

ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_question_count_check"
  CHECK ("question_count" > 0);

ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_score_check"
  CHECK ("score" IS NULL OR "score" BETWEEN 0 AND "question_count");

ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_position_check"
  CHECK ("position" >= 0);
