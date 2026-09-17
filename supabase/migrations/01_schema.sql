-- ==============================================================================
-- 01_schema.sql: Core Database Schema for Supabase
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM (
    'MEMBER',
    'STUDENT_MEMBER',
    'EDITOR',
    'EVENT_MANAGER',
    'ADMIN',
    'SUPER_ADMIN'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "EventType" AS ENUM ('CONFERENCE', 'WORKSHOP', 'WEBINAR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CourseType" AS ENUM (
    'SELF_PACED',
    'WEBINAR',
    'EXTENSIVE_ONLINE',
    'E_LECTURE',
    'INTERACTIVE_SHORT',
    'PARTNER_COURSE',
    'VIDEO'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. HELPER TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. USER PROFILES TABLE (Linked 1:1 with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  "id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "email" TEXT NOT NULL UNIQUE,
  "firstName" TEXT NOT NULL DEFAULT '',
  "lastName" TEXT NOT NULL DEFAULT '',
  "role" "Role" NOT NULL DEFAULT 'MEMBER',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Trigger to automatically create a profile record when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles ("id", "email", "firstName", "lastName", "role")
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'firstName', NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastName', NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::"Role", 'MEMBER'::"Role")
  )
  ON CONFLICT ("id") DO UPDATE
  SET
    "email" = EXCLUDED."email",
    "firstName" = CASE WHEN EXCLUDED."firstName" <> '' THEN EXCLUDED."firstName" ELSE public.profiles."firstName" END,
    "lastName" = CASE WHEN EXCLUDED."lastName" <> '' THEN EXCLUDED."lastName" ELSE public.profiles."lastName" END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. MEMBERSHIP PLANS
CREATE TABLE IF NOT EXISTS public."MembershipPlan" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DECIMAL(10,2) NOT NULL,
  "durationMonths" INTEGER NOT NULL DEFAULT 12,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_membershipplan_updated_at
  BEFORE UPDATE ON public."MembershipPlan"
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 5. MEMBERSHIPS
CREATE TABLE IF NOT EXISTS public."Membership" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" UUID NOT NULL REFERENCES public.profiles("id") ON DELETE CASCADE,
  "planId" TEXT NOT NULL REFERENCES public."MembershipPlan"("id") ON DELETE RESTRICT,
  "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',
  "startDate" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "endDate" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_membership_updated_at
  BEFORE UPDATE ON public."Membership"
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 6. EVENTS & CATEGORIES
CREATE TABLE IF NOT EXISTS public."Event" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "eventType" "EventType" NOT NULL,
  "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
  "startDate" TIMESTAMPTZ NOT NULL,
  "endDate" TIMESTAMPTZ NOT NULL,
  "location" TEXT,
  "online" BOOLEAN NOT NULL DEFAULT false,
  "registrationDeadline" TIMESTAMPTZ,
  "earlyBirdDeadline" TIMESTAMPTZ,
  "abstractDeadline" TIMESTAMPTZ,
  "priceMember" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  "priceNonMember" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  "organizer" TEXT,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_event_updated_at
  BEFORE UPDATE ON public."Event"
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TABLE IF NOT EXISTS public."EventCategory" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public."_EventToEventCategory" (
  "A" TEXT NOT NULL REFERENCES public."Event"("id") ON DELETE CASCADE,
  "B" TEXT NOT NULL REFERENCES public."EventCategory"("id") ON DELETE CASCADE,
  PRIMARY KEY ("A", "B")
);
CREATE INDEX IF NOT EXISTS "_EventToEventCategory_B_index" ON public."_EventToEventCategory"("B");

-- 7. EVENT REGISTRATIONS
CREATE TABLE IF NOT EXISTS public."EventRegistration" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventId" TEXT NOT NULL REFERENCES public."Event"("id") ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES public.profiles("id") ON DELETE CASCADE,
  "status" TEXT NOT NULL DEFAULT 'REGISTERED',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_eventreg_updated_at
  BEFORE UPDATE ON public."EventRegistration"
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 8. COURSES & CATEGORIES
CREATE TABLE IF NOT EXISTS public."Course" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "courseType" "CourseType" NOT NULL,
  "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
  "startDate" TIMESTAMPTZ,
  "endDate" TIMESTAMPTZ,
  "instructor" TEXT,
  "priceMember" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  "priceNonMember" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_course_updated_at
  BEFORE UPDATE ON public."Course"
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TABLE IF NOT EXISTS public."CourseCategory" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public."_CourseToCourseCategory" (
  "A" TEXT NOT NULL REFERENCES public."Course"("id") ON DELETE CASCADE,
  "B" TEXT NOT NULL REFERENCES public."CourseCategory"("id") ON DELETE CASCADE,
  PRIMARY KEY ("A", "B")
);
CREATE INDEX IF NOT EXISTS "_CourseToCourseCategory_B_index" ON public."_CourseToCourseCategory"("B");

-- 9. COURSE ENROLLMENTS
CREATE TABLE IF NOT EXISTS public."CourseEnrollment" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "courseId" TEXT NOT NULL REFERENCES public."Course"("id") ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES public.profiles("id") ON DELETE CASCADE,
  "status" TEXT NOT NULL DEFAULT 'ENROLLED',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_courseenr_updated_at
  BEFORE UPDATE ON public."CourseEnrollment"
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 10. PAYMENTS
CREATE TABLE IF NOT EXISTS public."Payment" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "membershipId" TEXT REFERENCES public."Membership"("id") ON DELETE SET NULL,
  "eventRegistrationId" TEXT REFERENCES public."EventRegistration"("id") ON DELETE SET NULL,
  "courseEnrollmentId" TEXT REFERENCES public."CourseEnrollment"("id") ON DELETE SET NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "status" TEXT NOT NULL, -- PENDING, COMPLETED, FAILED
  "provider" TEXT,
  "providerPaymentId" TEXT UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_payment_updated_at
  BEFORE UPDATE ON public."Payment"
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 11. ARTICLES, CATEGORIES & TAGS (CMS)
CREATE TABLE IF NOT EXISTS public."Article" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "excerpt" TEXT,
  "body" TEXT NOT NULL,
  "featuredImage" TEXT,
  "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMPTZ,
  "authorId" UUID REFERENCES public.profiles("id") ON DELETE SET NULL,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_article_updated_at
  BEFORE UPDATE ON public."Article"
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TABLE IF NOT EXISTS public."ArticleCategory" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public."_ArticleToArticleCategory" (
  "A" TEXT NOT NULL REFERENCES public."Article"("id") ON DELETE CASCADE,
  "B" TEXT NOT NULL REFERENCES public."ArticleCategory"("id") ON DELETE CASCADE,
  PRIMARY KEY ("A", "B")
);
CREATE INDEX IF NOT EXISTS "_ArticleToArticleCategory_B_index" ON public."_ArticleToArticleCategory"("B");

CREATE TABLE IF NOT EXISTS public."Tag" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public."_ArticleToTag" (
  "A" TEXT NOT NULL REFERENCES public."Article"("id") ON DELETE CASCADE,
  "B" TEXT NOT NULL REFERENCES public."Tag"("id") ON DELETE CASCADE,
  PRIMARY KEY ("A", "B")
);
CREATE INDEX IF NOT EXISTS "_ArticleToTag_B_index" ON public."_ArticleToTag"("B");

-- 12. STATIC PAGES
CREATE TABLE IF NOT EXISTS public."Page" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_page_updated_at
  BEFORE UPDATE ON public."Page"
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 13. MEDIA ASSETS
CREATE TABLE IF NOT EXISTS public."MediaAsset" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "filename" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "path" TEXT NOT NULL,
  "uploaderId" UUID NOT NULL REFERENCES public.profiles("id") ON DELETE RESTRICT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. COMMUNITIES
CREATE TABLE IF NOT EXISTS public."Community" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "slug" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- SIG or CHAPTER
  "imageUrl" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_community_updated_at
  BEFORE UPDATE ON public."Community"
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TABLE IF NOT EXISTS public."CommunityMember" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "communityId" TEXT NOT NULL REFERENCES public."Community"("id") ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES public.profiles("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL DEFAULT 'MEMBER',
  "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("communityId", "userId")
);

-- 15. FORMS & SUBMISSIONS
CREATE TABLE IF NOT EXISTS public."FormDefinition" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "key" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "fields" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_formdef_updated_at
  BEFORE UPDATE ON public."FormDefinition"
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TABLE IF NOT EXISTS public."FormSubmission" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "formDefinitionId" TEXT NOT NULL REFERENCES public."FormDefinition"("id") ON DELETE CASCADE,
  "userId" UUID REFERENCES public.profiles("id") ON DELETE SET NULL,
  "email" TEXT,
  "data" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."ContactMessage" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'GENERAL',
  "status" TEXT NOT NULL DEFAULT 'UNREAD',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. SITE SETTINGS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS public."SiteSetting" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "key" TEXT NOT NULL UNIQUE,
  "value" TEXT NOT NULL,
  "description" TEXT,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."AuditLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" UUID REFERENCES public.profiles("id") ON DELETE SET NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "details" TEXT,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
