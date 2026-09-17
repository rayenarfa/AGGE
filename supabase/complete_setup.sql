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
-- ==============================================================================
-- 02_row_level_security.sql: Row Level Security & Access Policies
-- ==============================================================================

-- 1. SECURITY DEFINER HELPER FUNCTIONS (Prevent Infinite Recursion)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public."Role" AS $$
  SELECT "role" FROM public.profiles WHERE "id" = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE "id" = auth.uid() AND "role" IN ('ADMIN', 'SUPER_ADMIN')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE "id" = auth.uid() AND "role" IN ('ADMIN', 'SUPER_ADMIN', 'EDITOR')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_event_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE "id" = auth.uid() AND "role" IN ('ADMIN', 'SUPER_ADMIN', 'EVENT_MANAGER')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 2. ENABLE RLS ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MembershipPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Membership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EventCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_EventToEventCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EventRegistration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Course" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CourseCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_CourseToCourseCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CourseEnrollment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Article" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ArticleCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_ArticleToArticleCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Tag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_ArticleToTag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Page" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MediaAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Community" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CommunityMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FormDefinition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FormSubmission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ContactMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SiteSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuditLog" ENABLE ROW LEVEL SECURITY;

-- 3. PROFILES POLICIES
DROP POLICY IF EXISTS "Profiles read access" ON public.profiles;
CREATE POLICY "Profiles read access" ON public.profiles
  FOR SELECT USING (auth.uid() = "id" OR public.is_admin());

DROP POLICY IF EXISTS "Profiles self update" ON public.profiles;
CREATE POLICY "Profiles self update" ON public.profiles
  FOR UPDATE USING (auth.uid() = "id" OR public.is_admin())
  WITH CHECK (auth.uid() = "id" OR public.is_admin());

DROP POLICY IF EXISTS "Profiles insert" ON public.profiles;
CREATE POLICY "Profiles insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = "id" OR public.is_admin());

-- 4. MEMBERSHIP PLANS POLICIES
DROP POLICY IF EXISTS "MembershipPlan public view" ON public."MembershipPlan";
CREATE POLICY "MembershipPlan public view" ON public."MembershipPlan"
  FOR SELECT USING ("isActive" = true OR public.is_admin());

DROP POLICY IF EXISTS "MembershipPlan admin all" ON public."MembershipPlan";
CREATE POLICY "MembershipPlan admin all" ON public."MembershipPlan"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. MEMBERSHIPS POLICIES
DROP POLICY IF EXISTS "Membership user view" ON public."Membership";
CREATE POLICY "Membership user view" ON public."Membership"
  FOR SELECT USING ("userId" = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Membership user insert" ON public."Membership";
CREATE POLICY "Membership user insert" ON public."Membership"
  FOR INSERT WITH CHECK ("userId" = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Membership admin manage" ON public."Membership";
CREATE POLICY "Membership admin manage" ON public."Membership"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. EVENTS POLICIES
DROP POLICY IF EXISTS "Event public view" ON public."Event";
CREATE POLICY "Event public view" ON public."Event"
  FOR SELECT USING ("status" = 'PUBLISHED' OR public.is_editor() OR public.is_event_manager());

DROP POLICY IF EXISTS "Event manager manage" ON public."Event";
CREATE POLICY "Event manager manage" ON public."Event"
  FOR ALL USING (public.is_editor() OR public.is_event_manager())
  WITH CHECK (public.is_editor() OR public.is_event_manager());

DROP POLICY IF EXISTS "EventCategory public view" ON public."EventCategory";
CREATE POLICY "EventCategory public view" ON public."EventCategory"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "EventCategory manage" ON public."EventCategory";
CREATE POLICY "EventCategory manage" ON public."EventCategory"
  FOR ALL USING (public.is_editor() OR public.is_event_manager())
  WITH CHECK (public.is_editor() OR public.is_event_manager());

DROP POLICY IF EXISTS "_EventToEventCategory public view" ON public."_EventToEventCategory";
CREATE POLICY "_EventToEventCategory public view" ON public."_EventToEventCategory"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "_EventToEventCategory manage" ON public."_EventToEventCategory";
CREATE POLICY "_EventToEventCategory manage" ON public."_EventToEventCategory"
  FOR ALL USING (public.is_editor() OR public.is_event_manager())
  WITH CHECK (public.is_editor() OR public.is_event_manager());

-- 7. EVENT REGISTRATIONS POLICIES
DROP POLICY IF EXISTS "EventRegistration view" ON public."EventRegistration";
CREATE POLICY "EventRegistration view" ON public."EventRegistration"
  FOR SELECT USING ("userId" = auth.uid() OR public.is_event_manager() OR public.is_admin());

DROP POLICY IF EXISTS "EventRegistration insert" ON public."EventRegistration";
CREATE POLICY "EventRegistration insert" ON public."EventRegistration"
  FOR INSERT WITH CHECK ("userId" = auth.uid() OR public.is_event_manager() OR public.is_admin());

DROP POLICY IF EXISTS "EventRegistration manage" ON public."EventRegistration";
CREATE POLICY "EventRegistration manage" ON public."EventRegistration"
  FOR ALL USING (public.is_event_manager() OR public.is_admin())
  WITH CHECK (public.is_event_manager() OR public.is_admin());

-- 8. COURSES POLICIES
DROP POLICY IF EXISTS "Course public view" ON public."Course";
CREATE POLICY "Course public view" ON public."Course"
  FOR SELECT USING ("status" = 'PUBLISHED' OR public.is_editor());

DROP POLICY IF EXISTS "Course editor manage" ON public."Course";
CREATE POLICY "Course editor manage" ON public."Course"
  FOR ALL USING (public.is_editor())
  WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS "CourseCategory public view" ON public."CourseCategory";
CREATE POLICY "CourseCategory public view" ON public."CourseCategory"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "CourseCategory manage" ON public."CourseCategory";
CREATE POLICY "CourseCategory manage" ON public."CourseCategory"
  FOR ALL USING (public.is_editor())
  WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS "_CourseToCourseCategory public view" ON public."_CourseToCourseCategory";
CREATE POLICY "_CourseToCourseCategory public view" ON public."_CourseToCourseCategory"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "_CourseToCourseCategory manage" ON public."_CourseToCourseCategory";
CREATE POLICY "_CourseToCourseCategory manage" ON public."_CourseToCourseCategory"
  FOR ALL USING (public.is_editor())
  WITH CHECK (public.is_editor());

-- 9. COURSE ENROLLMENTS POLICIES
DROP POLICY IF EXISTS "CourseEnrollment view" ON public."CourseEnrollment";
CREATE POLICY "CourseEnrollment view" ON public."CourseEnrollment"
  FOR SELECT USING ("userId" = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "CourseEnrollment insert" ON public."CourseEnrollment";
CREATE POLICY "CourseEnrollment insert" ON public."CourseEnrollment"
  FOR INSERT WITH CHECK ("userId" = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "CourseEnrollment manage" ON public."CourseEnrollment";
CREATE POLICY "CourseEnrollment manage" ON public."CourseEnrollment"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 10. PAYMENTS POLICIES
DROP POLICY IF EXISTS "Payment view" ON public."Payment";
CREATE POLICY "Payment view" ON public."Payment"
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public."Membership" m WHERE m."id" = "membershipId" AND m."userId" = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public."EventRegistration" er WHERE er."id" = "eventRegistrationId" AND er."userId" = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public."CourseEnrollment" ce WHERE ce."id" = "courseEnrollmentId" AND ce."userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Payment manage" ON public."Payment";
CREATE POLICY "Payment manage" ON public."Payment"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 11. ARTICLES POLICIES
DROP POLICY IF EXISTS "Article public view" ON public."Article";
CREATE POLICY "Article public view" ON public."Article"
  FOR SELECT USING ("status" = 'PUBLISHED' OR public.is_editor());

DROP POLICY IF EXISTS "Article editor manage" ON public."Article";
CREATE POLICY "Article editor manage" ON public."Article"
  FOR ALL USING (public.is_editor())
  WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS "ArticleCategory public view" ON public."ArticleCategory";
CREATE POLICY "ArticleCategory public view" ON public."ArticleCategory"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "ArticleCategory manage" ON public."ArticleCategory";
CREATE POLICY "ArticleCategory manage" ON public."ArticleCategory"
  FOR ALL USING (public.is_editor())
  WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS "_ArticleToArticleCategory public view" ON public."_ArticleToArticleCategory";
CREATE POLICY "_ArticleToArticleCategory public view" ON public."_ArticleToArticleCategory"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "_ArticleToArticleCategory manage" ON public."_ArticleToArticleCategory";
CREATE POLICY "_ArticleToArticleCategory manage" ON public."_ArticleToArticleCategory"
  FOR ALL USING (public.is_editor())
  WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS "Tag public view" ON public."Tag";
CREATE POLICY "Tag public view" ON public."Tag"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tag manage" ON public."Tag";
CREATE POLICY "Tag manage" ON public."Tag"
  FOR ALL USING (public.is_editor())
  WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS "_ArticleToTag public view" ON public."_ArticleToTag";
CREATE POLICY "_ArticleToTag public view" ON public."_ArticleToTag"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "_ArticleToTag manage" ON public."_ArticleToTag";
CREATE POLICY "_ArticleToTag manage" ON public."_ArticleToTag"
  FOR ALL USING (public.is_editor())
  WITH CHECK (public.is_editor());

-- 12. PAGES POLICIES
DROP POLICY IF EXISTS "Page public view" ON public."Page";
CREATE POLICY "Page public view" ON public."Page"
  FOR SELECT USING ("status" = 'PUBLISHED' OR public.is_editor());

DROP POLICY IF EXISTS "Page editor manage" ON public."Page";
CREATE POLICY "Page editor manage" ON public."Page"
  FOR ALL USING (public.is_editor())
  WITH CHECK (public.is_editor());

-- 13. MEDIA ASSETS POLICIES
DROP POLICY IF EXISTS "MediaAsset public view" ON public."MediaAsset";
CREATE POLICY "MediaAsset public view" ON public."MediaAsset"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "MediaAsset editor manage" ON public."MediaAsset";
CREATE POLICY "MediaAsset editor manage" ON public."MediaAsset"
  FOR ALL USING (public.is_editor())
  WITH CHECK (public.is_editor());

-- 14. COMMUNITIES POLICIES
DROP POLICY IF EXISTS "Community public view" ON public."Community";
CREATE POLICY "Community public view" ON public."Community"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Community admin manage" ON public."Community";
CREATE POLICY "Community admin manage" ON public."Community"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "CommunityMember public view" ON public."CommunityMember";
CREATE POLICY "CommunityMember public view" ON public."CommunityMember"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "CommunityMember user join" ON public."CommunityMember";
CREATE POLICY "CommunityMember user join" ON public."CommunityMember"
  FOR INSERT WITH CHECK ("userId" = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "CommunityMember user leave" ON public."CommunityMember";
CREATE POLICY "CommunityMember user leave" ON public."CommunityMember"
  FOR DELETE USING ("userId" = auth.uid() OR public.is_admin());

-- 15. FORMS & SUBMISSIONS POLICIES
DROP POLICY IF EXISTS "FormDefinition public view" ON public."FormDefinition";
CREATE POLICY "FormDefinition public view" ON public."FormDefinition"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "FormDefinition admin manage" ON public."FormDefinition";
CREATE POLICY "FormDefinition admin manage" ON public."FormDefinition"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "FormSubmission public insert" ON public."FormSubmission";
CREATE POLICY "FormSubmission public insert" ON public."FormSubmission"
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "FormSubmission admin manage" ON public."FormSubmission";
CREATE POLICY "FormSubmission admin manage" ON public."FormSubmission"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "ContactMessage public insert" ON public."ContactMessage";
CREATE POLICY "ContactMessage public insert" ON public."ContactMessage"
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "ContactMessage admin manage" ON public."ContactMessage";
CREATE POLICY "ContactMessage admin manage" ON public."ContactMessage"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 16. SITE SETTINGS & AUDIT LOGS POLICIES
DROP POLICY IF EXISTS "SiteSetting public view" ON public."SiteSetting";
CREATE POLICY "SiteSetting public view" ON public."SiteSetting"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "SiteSetting admin manage" ON public."SiteSetting";
CREATE POLICY "SiteSetting admin manage" ON public."SiteSetting"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "AuditLog admin view" ON public."AuditLog";
CREATE POLICY "AuditLog admin view" ON public."AuditLog"
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "AuditLog insert" ON public."AuditLog";
CREATE POLICY "AuditLog insert" ON public."AuditLog"
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR public.is_admin());
-- ==============================================================================
-- 03_storage.sql: Supabase Storage Buckets & Policies
-- ==============================================================================

-- 1. CREATE 'media' PUBLIC BUCKET
INSERT INTO storage.buckets ("id", "name", "public", "file_size_limit", "allowed_mime_types")
VALUES (
  'media',
  'media',
  true,
  52428800, -- 50MB max file size
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT ("id") DO UPDATE SET
  "public" = true,
  "file_size_limit" = 52428800;

-- 2. STORAGE OBJECTS POLICIES
-- Allow public read access to media bucket assets
DROP POLICY IF EXISTS "Public Read Media" ON storage.objects;
CREATE POLICY "Public Read Media" ON storage.objects
  FOR SELECT USING ("bucket_id" = 'media');

-- Allow authenticated editors and admins to upload media files
DROP POLICY IF EXISTS "Authenticated Upload Media" ON storage.objects;
CREATE POLICY "Authenticated Upload Media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    "bucket_id" = 'media'
    AND (public.is_editor() OR public.is_admin())
  );

-- Allow authenticated editors and admins to update media files
DROP POLICY IF EXISTS "Authenticated Update Media" ON storage.objects;
CREATE POLICY "Authenticated Update Media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    "bucket_id" = 'media'
    AND (public.is_editor() OR public.is_admin())
  )
  WITH CHECK (
    "bucket_id" = 'media'
    AND (public.is_editor() OR public.is_admin())
  );

-- Allow authenticated editors and admins to delete media files
DROP POLICY IF EXISTS "Authenticated Delete Media" ON storage.objects;
CREATE POLICY "Authenticated Delete Media" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    "bucket_id" = 'media'
    AND (public.is_editor() OR public.is_admin())
  );
-- ==============================================================================
-- 04_rpc_functions.sql: PostgreSQL RPC Stored Functions for AGGE
-- ==============================================================================

-- 1. CREATE CHECKOUT SESSION
CREATE OR REPLACE FUNCTION public.create_checkout_session(
  p_type TEXT,
  p_target_id TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_amount NUMERIC(10,2) := 0.00;
  v_description TEXT := '';
  v_membership_id TEXT := NULL;
  v_event_reg_id TEXT := NULL;
  v_course_enr_id TEXT := NULL;
  v_payment_id TEXT;
  v_plan RECORD;
  v_event RECORD;
  v_course RECORD;
  v_has_active_membership BOOLEAN := FALSE;
  v_end_date TIMESTAMPTZ;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: You must be logged in to initiate checkout.';
  END IF;

  IF p_type NOT IN ('MEMBERSHIP', 'EVENT', 'COURSE') OR p_target_id IS NULL THEN
    RAISE EXCEPTION 'Invalid checkout type or target ID.';
  END IF;

  -- 1. Check if user has active membership
  SELECT EXISTS (
    SELECT 1 FROM public."Membership"
    WHERE "userId" = v_user_id AND "status" = 'ACTIVE' AND "endDate" > NOW()
  ) INTO v_has_active_membership;

  -- 2. Handle MEMBERSHIP
  IF p_type = 'MEMBERSHIP' THEN
    SELECT * INTO v_plan FROM public."MembershipPlan" WHERE "id" = p_target_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Membership plan not found.';
    END IF;

    v_amount := v_plan."price";
    v_description := 'AGGE Membership - ' || v_plan."name";
    v_end_date := NOW() + (v_plan."durationMonths" || ' months')::INTERVAL;

    INSERT INTO public."Membership" ("userId", "planId", "status", "startDate", "endDate")
    VALUES (v_user_id, v_plan."id", 'PENDING', NOW(), v_end_date)
    RETURNING "id" INTO v_membership_id;

  -- 3. Handle EVENT
  ELSIF p_type = 'EVENT' THEN
    SELECT * INTO v_event FROM public."Event" WHERE "id" = p_target_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Event not found.';
    END IF;

    IF EXISTS (
      SELECT 1 FROM public."EventRegistration"
      WHERE "eventId" = v_event."id" AND "userId" = v_user_id AND "status" = 'REGISTERED'
    ) THEN
      RAISE EXCEPTION 'You are already registered for this event.';
    END IF;

    IF v_has_active_membership THEN
      v_amount := v_event."priceMember";
    ELSE
      v_amount := v_event."priceNonMember";
    END IF;

    v_description := 'Registration for Event: ' || v_event."title";

    INSERT INTO public."EventRegistration" ("eventId", "userId", "status")
    VALUES (v_event."id", v_user_id, 'PENDING_PAYMENT')
    RETURNING "id" INTO v_event_reg_id;

  -- 4. Handle COURSE
  ELSIF p_type = 'COURSE' THEN
    SELECT * INTO v_course FROM public."Course" WHERE "id" = p_target_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Course not found.';
    END IF;

    IF v_has_active_membership THEN
      v_amount := v_course."priceMember";
    ELSE
      v_amount := v_course."priceNonMember";
    END IF;

    v_description := 'Enrollment in Course: ' || v_course."title";

    INSERT INTO public."CourseEnrollment" ("courseId", "userId", "status")
    VALUES (v_course."id", v_user_id, 'PENDING_PAYMENT')
    RETURNING "id" INTO v_course_enr_id;
  END IF;

  -- 5. Auto-complete if price is 0.00
  IF v_amount <= 0.00 THEN
    IF p_type = 'MEMBERSHIP' THEN
      UPDATE public."Membership" SET "status" = 'ACTIVE' WHERE "id" = v_membership_id;
    ELSIF p_type = 'EVENT' THEN
      UPDATE public."EventRegistration" SET "status" = 'REGISTERED' WHERE "id" = v_event_reg_id;
    ELSIF p_type = 'COURSE' THEN
      UPDATE public."CourseEnrollment" SET "status" = 'ENROLLED' WHERE "id" = v_course_enr_id;
    END IF;

    INSERT INTO public."Payment" (
      "membershipId", "eventRegistrationId", "courseEnrollmentId", "amount", "status", "provider"
    )
    VALUES (
      v_membership_id, v_event_reg_id, v_course_enr_id, 0.00, 'COMPLETED', 'Free tier / Auto'
    )
    RETURNING "id" INTO v_payment_id;

    RETURN json_build_object(
      'free', true,
      'message', 'Registration completed successfully without payment details.',
      'paymentId', v_payment_id
    );
  END IF;

  -- 6. Paid Session
  INSERT INTO public."Payment" (
    "membershipId", "eventRegistrationId", "courseEnrollmentId", "amount", "status", "provider"
  )
  VALUES (
    v_membership_id, v_event_reg_id, v_course_enr_id, v_amount, 'PENDING', 'Stripe'
  )
  RETURNING "id" INTO v_payment_id;

  UPDATE public."Payment"
  SET "providerPaymentId" = 'session_' || v_payment_id
  WHERE "id" = v_payment_id;

  RETURN json_build_object(
    'free', false,
    'sessionId', v_payment_id,
    'amount', v_amount,
    'description', v_description,
    'checkoutUrl', '/checkout/gateway?sessionId=' || v_payment_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. PROCESS SIMULATED WEBHOOK
CREATE OR REPLACE FUNCTION public.process_simulated_webhook(
  p_session_id TEXT,
  p_status TEXT
)
RETURNS JSON AS $$
DECLARE
  v_payment RECORD;
  v_target_status TEXT;
  v_target_ref_id TEXT;
BEGIN
  IF p_session_id IS NULL OR p_status NOT IN ('SUCCESS', 'FAIL') THEN
    RAISE EXCEPTION 'Invalid webhook event parameters.';
  END IF;

  SELECT * INTO v_payment FROM public."Payment" WHERE "id" = p_session_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment session not found.';
  END IF;

  IF v_payment."status" <> 'PENDING' THEN
    RAISE EXCEPTION 'Payment has already been processed.';
  END IF;

  v_target_status := CASE WHEN p_status = 'SUCCESS' THEN 'COMPLETED' ELSE 'FAILED' END;

  UPDATE public."Payment"
  SET "status" = v_target_status, "updatedAt" = NOW()
  WHERE "id" = p_session_id;

  IF v_payment."membershipId" IS NOT NULL THEN
    UPDATE public."Membership"
    SET "status" = CASE WHEN p_status = 'SUCCESS' THEN 'ACTIVE'::public."MembershipStatus" ELSE 'CANCELLED'::public."MembershipStatus" END,
        "updatedAt" = NOW()
    WHERE "id" = v_payment."membershipId";
    v_target_ref_id := v_payment."membershipId";
  ELSIF v_payment."eventRegistrationId" IS NOT NULL THEN
    UPDATE public."EventRegistration"
    SET "status" = CASE WHEN p_status = 'SUCCESS' THEN 'REGISTERED' ELSE 'CANCELLED' END,
        "updatedAt" = NOW()
    WHERE "id" = v_payment."eventRegistrationId";
    v_target_ref_id := v_payment."eventRegistrationId";
  ELSIF v_payment."courseEnrollmentId" IS NOT NULL THEN
    UPDATE public."CourseEnrollment"
    SET "status" = CASE WHEN p_status = 'SUCCESS' THEN 'ENROLLED' ELSE 'CANCELLED' END,
        "updatedAt" = NOW()
    WHERE "id" = v_payment."courseEnrollmentId";
    v_target_ref_id := v_payment."courseEnrollmentId";
  END IF;

  -- Create Audit Log
  INSERT INTO public."AuditLog" ("action", "entityType", "entityId", "details")
  VALUES (
    'PAYMENT_WEBHOOK_PROCESSED',
    'Payment',
    p_session_id,
    'Simulated webhook updated transaction status to ' || v_target_status || ' (Target: ' || COALESCE(v_target_ref_id, 'None') || ')'
  );

  SELECT * INTO v_payment FROM public."Payment" WHERE "id" = p_session_id;

  RETURN json_build_object(
    'message', 'Webhook processed successfully',
    'payment', row_to_json(v_payment)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. ADMIN DASHBOARD STATS
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  v_total_users BIGINT;
  v_active_members BIGINT;
  v_pending_submissions BIGINT;
  v_revenue_total NUMERIC(10,2);
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Administrator privileges required.';
  END IF;

  SELECT COUNT(*) INTO v_total_users FROM public.profiles;
  SELECT COUNT(*) INTO v_active_members FROM public."Membership" WHERE "status" = 'ACTIVE';
  SELECT COUNT(*) INTO v_pending_submissions FROM public."FormSubmission" WHERE "status" = 'PENDING';
  SELECT COALESCE(SUM("amount"), 0.00) INTO v_revenue_total FROM public."Payment" WHERE "status" = 'COMPLETED';

  RETURN json_build_object(
    'stats', json_build_object(
      'totalUsers', v_total_users,
      'activeMembers', v_active_members,
      'pendingSubmissions', v_pending_submissions,
      'revenueTotal', v_revenue_total
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. UNIFIED CALENDAR FEED
CREATE OR REPLACE FUNCTION public.get_calendar_feed(
  p_search TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'ALL',
  p_event_type TEXT DEFAULT NULL,
  p_course_type TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_online BOOLEAN DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_items JSON;
BEGIN
  WITH combined AS (
    -- 1. Events
    SELECT
      e."id",
      e."slug",
      e."title",
      'EVENT' AS "itemType",
      e."eventType"::TEXT AS "subType",
      e."startDate",
      e."endDate",
      CASE WHEN e."online" THEN 'Online' ELSE COALESCE(e."location", 'TBA') END AS "location",
      e."online",
      COALESCE(cat."name", 'General') AS "category"
    FROM public."Event" e
    LEFT JOIN LATERAL (
      SELECT ec."name", ec."slug"
      FROM public."_EventToEventCategory" j
      JOIN public."EventCategory" ec ON ec."id" = j."B"
      WHERE j."A" = e."id"
      LIMIT 1
    ) cat ON true
    WHERE e."status" = 'PUBLISHED'
      AND (p_type IS NULL OR p_type = 'ALL' OR p_type = 'EVENT')
      AND (p_event_type IS NULL OR e."eventType"::TEXT = p_event_type)
      AND (p_online IS NULL OR e."online" = p_online)
      AND (p_category IS NULL OR cat."slug" = p_category)
      AND (p_start_date IS NULL OR e."startDate" >= p_start_date)
      AND (p_end_date IS NULL OR e."endDate" <= p_end_date)
      AND (
        p_search IS NULL OR
        e."title" ILIKE '%' || p_search || '%' OR
        e."description" ILIKE '%' || p_search || '%'
      )

    UNION ALL

    -- 2. Courses
    SELECT
      c."id",
      c."slug",
      c."title",
      'COURSE' AS "itemType",
      c."courseType"::TEXT AS "subType",
      c."startDate",
      c."endDate",
      'Online' AS "location",
      true AS "online",
      COALESCE(ccat."name", 'Education') AS "category"
    FROM public."Course" c
    LEFT JOIN LATERAL (
      SELECT cc."name", cc."slug"
      FROM public."_CourseToCourseCategory" j
      JOIN public."CourseCategory" cc ON cc."id" = j."B"
      WHERE j."A" = c."id"
      LIMIT 1
    ) ccat ON true
    WHERE c."status" = 'PUBLISHED'
      AND (p_type IS NULL OR p_type = 'ALL' OR p_type = 'COURSE')
      AND (p_course_type IS NULL OR c."courseType"::TEXT = p_course_type)
      AND (p_online IS NULL OR p_online = true) -- courses are always online
      AND (p_category IS NULL OR ccat."slug" = p_category)
      AND (p_start_date IS NULL OR c."startDate" >= p_start_date)
      AND (p_end_date IS NULL OR c."endDate" <= p_end_date)
      AND (
        p_search IS NULL OR
        c."title" ILIKE '%' || p_search || '%' OR
        c."description" ILIKE '%' || p_search || '%'
      )
  )
  SELECT COALESCE(json_agg(combined ORDER BY "startDate" ASC NULLS LAST), '[]'::json)
  INTO v_items
  FROM combined;

  RETURN json_build_object('items', v_items);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 5. MEMBER DASHBOARD AGGREGATOR
CREATE OR REPLACE FUNCTION public.get_user_dashboard()
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_membership JSON;
  v_payments JSON;
  v_events JSON;
  v_courses JSON;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User not authenticated.';
  END IF;

  -- 1. Latest membership
  SELECT row_to_json(m_row) INTO v_membership
  FROM (
    SELECT m.*, row_to_json(p) AS plan
    FROM public."Membership" m
    JOIN public."MembershipPlan" p ON p."id" = m."planId"
    WHERE m."userId" = v_user_id
    ORDER BY m."endDate" DESC
    LIMIT 1
  ) m_row;

  -- 2. Payments
  SELECT COALESCE(json_agg(p_row), '[]'::json) INTO v_payments
  FROM (
    SELECT
      pay."id",
      pay."amount",
      pay."currency",
      pay."status",
      pay."createdAt",
      CASE
        WHEN m."id" IS NOT NULL THEN 'Membership Plan: ' || mp."name"
        WHEN er."id" IS NOT NULL THEN 'Event Registration: ' || ev."title"
        WHEN ce."id" IS NOT NULL THEN 'Course Enrollment: ' || co."title"
        ELSE 'General Payment'
      END AS "description"
    FROM public."Payment" pay
    LEFT JOIN public."Membership" m ON m."id" = pay."membershipId"
    LEFT JOIN public."MembershipPlan" mp ON mp."id" = m."planId"
    LEFT JOIN public."EventRegistration" er ON er."id" = pay."eventRegistrationId"
    LEFT JOIN public."Event" ev ON ev."id" = er."eventId"
    LEFT JOIN public."CourseEnrollment" ce ON ce."id" = pay."courseEnrollmentId"
    LEFT JOIN public."Course" co ON co."id" = ce."courseId"
    WHERE m."userId" = v_user_id
       OR er."userId" = v_user_id
       OR ce."userId" = v_user_id
    ORDER BY pay."createdAt" DESC
  ) p_row;

  -- 3. Events registered
  SELECT COALESCE(json_agg(e_row), '[]'::json) INTO v_events
  FROM (
    SELECT
      er."id" AS "registrationId",
      er."status",
      er."createdAt" AS "registeredAt",
      ev."id",
      ev."title",
      ev."slug",
      ev."startDate",
      ev."endDate",
      ev."location",
      ev."online",
      ev."eventType"
    FROM public."EventRegistration" er
    JOIN public."Event" ev ON ev."id" = er."eventId"
    WHERE er."userId" = v_user_id
    ORDER BY er."createdAt" DESC
  ) e_row;

  -- 4. Courses enrolled
  SELECT COALESCE(json_agg(c_row), '[]'::json) INTO v_courses
  FROM (
    SELECT
      ce."id" AS "enrollmentId",
      ce."status",
      ce."createdAt" AS "enrolledAt",
      co."id",
      co."title",
      co."slug",
      co."startDate",
      co."instructor",
      co."courseType"
    FROM public."CourseEnrollment" ce
    JOIN public."Course" co ON co."id" = ce."courseId"
    WHERE ce."userId" = v_user_id
    ORDER BY ce."createdAt" DESC
  ) c_row;

  RETURN json_build_object(
    'membership', v_membership,
    'payments', v_payments,
    'events', v_events,
    'courses', v_courses
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;
-- ==============================================================================
-- 05_seed.sql: Initial Seed Data for AGGE
-- ==============================================================================

-- 1. MEMBERSHIP PLANS
INSERT INTO public."MembershipPlan" ("id", "name", "price", "durationMonths", "description", "isActive")
VALUES
  (
    'plan-individual',
    'Individual Membership',
    120.00,
    12,
    'Standard plan for geoscience and engineering professionals. Access to journals and event discounts.',
    true
  ),
  (
    'plan-student',
    'Student Membership',
    30.00,
    12,
    'Discounted plan for students and young researchers. Includes mentoring program eligibility.',
    true
  ),
  (
    'plan-corporate',
    'Corporate Membership',
    500.00,
    12,
    'Plan for corporate teams, agencies, and academic departments. Custom registration quotas.',
    true
  )
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price",
  "description" = EXCLUDED."description";

-- 2. EVENT CATEGORIES
INSERT INTO public."EventCategory" ("id", "name", "slug")
VALUES
  ('ec-near-surface', 'Near Surface', 'near-surface'),
  ('ec-energy-transition', 'Energy Transition', 'energy-transition'),
  ('ec-geophysics', 'Geophysics', 'geophysics'),
  ('ec-geology', 'Geology', 'geology')
ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name";

-- 3. EVENTS
INSERT INTO public."Event" (
  "id", "slug", "title", "description", "eventType", "status",
  "startDate", "endDate", "location", "online",
  "registrationDeadline", "earlyBirdDeadline", "abstractDeadline",
  "priceMember", "priceNonMember", "organizer", "imageUrl"
)
VALUES
  (
    'ev-near-surface-2026',
    'near-surface-geoscience-2026',
    'Near Surface Geoscience Conference & Exhibition 2026',
    'Join us in Thessaloniki for the premier near-surface geophysical meeting. Topics include hydrology, environmental engineering, shallow hazard monitoring, and new sensor configurations. Includes technical paper panels and a vibrant exhibition space.',
    'CONFERENCE',
    'PUBLISHED',
    '2026-09-20T09:00:00Z',
    '2026-09-24T17:00:00Z',
    'Thessaloniki, Greece',
    false,
    '2026-09-10T23:59:59Z',
    '2026-07-31T23:59:59Z',
    '2026-05-15T23:59:59Z',
    250.00,
    350.00,
    'AGGE Europe Secretariat',
    'https://images.unsplash.com/photo-1544006659-f0840aa73740?w=800&auto=format&fit=crop&q=60'
  ),
  (
    'ev-energy-transition-2026',
    'energy-transition-conference-2026',
    '7th AGGE Global Energy Transition Conference & Exhibition',
    'The 7th iteration of our landmark energy transition forum. This year we focus on carbon sequestration site development, geothermal networks exploration, hydrogen storage mechanics, and mining minerals for green storage cells.',
    'CONFERENCE',
    'PUBLISHED',
    '2026-11-02T09:00:00Z',
    '2026-11-06T17:00:00Z',
    'Hannover, Germany',
    false,
    '2026-10-25T23:59:59Z',
    '2026-09-01T23:59:59Z',
    '2026-06-30T23:59:59Z',
    220.00,
    320.00,
    'AGGE Energy SIG',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=60'
  ),
  (
    'ev-co2-storage-2026',
    'co2-storage-masterclass-2026',
    'AGGE Masterclass CO₂ Storage 2026',
    'An intensive technical workshop covering CCS site screening, modeling, reservoir simulation, integrity monitoring (seismic and gravimetric), and risk registers. Case studies are pulled from mature North Sea operations.',
    'WORKSHOP',
    'PUBLISHED',
    '2026-12-01T10:00:00Z',
    '2026-12-04T16:00:00Z',
    'Online',
    true,
    '2026-11-28T23:59:59Z',
    null,
    null,
    80.00,
    120.00,
    'AGGE Technical Training',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60'
  ),
  (
    'ev-structural-geology-must-knows',
    'structural-geology-must-knows',
    'Short Course: Structural Geology Must-Knows',
    'This short course goes back to the basics and builds up to advanced modeling. Topics include fault seal analyses, fold-thrust belt kinematics, salt tectonics, and fracturing diagnostics. Essential for structural geologists and geophysicists alike.',
    'WORKSHOP',
    'PUBLISHED',
    '2026-09-01T09:00:00Z',
    '2026-09-03T16:00:00Z',
    'Online',
    true,
    '2026-08-28T23:59:59Z',
    null,
    null,
    70.00,
    100.00,
    'Learning Geoscience',
    'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800&auto=format&fit=crop&q=60'
  ),
  (
    'ev-dlp-geothermal',
    'dlp-geothermal-resources',
    'DLP Webinar: Conceptual-Model Based Exploration of Geothermal Resources',
    'Our Distinguished Lecturer series presents conceptual model-based workflows for deep and shallow geothermal exploration. Explore geologic structures mapping, thermal logs analysis, and reservoir quality assessments.',
    'WEBINAR',
    'PUBLISHED',
    '2026-08-12T14:00:00Z',
    '2026-08-12T15:30:00Z',
    'Online',
    true,
    '2026-08-12T13:00:00Z',
    null,
    null,
    0.00,
    0.00,
    'AGGE Communities',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'
  ),
  (
    'ev-annual-conference-2025',
    'annual-conference-2025',
    'AGGE Annual Conference 2025',
    'The historic flagship AGGE Annual Conference from 2025. Brought together thousands of researchers, engineers, and companies to Hannover for keynotes, breakout panels, and networking events. Past archives are open to current active members.',
    'CONFERENCE',
    'PUBLISHED',
    '2025-10-27T09:00:00Z',
    '2025-10-31T17:00:00Z',
    'Hannover, Germany',
    false,
    null,
    null,
    null,
    300.00,
    400.00,
    'AGGE Executive Committee',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'
  )
ON CONFLICT ("slug") DO UPDATE SET
  "title" = EXCLUDED."title",
  "description" = EXCLUDED."description",
  "priceMember" = EXCLUDED."priceMember",
  "priceNonMember" = EXCLUDED."priceNonMember";

-- Event categories join
INSERT INTO public."_EventToEventCategory" ("A", "B")
VALUES
  ('ev-near-surface-2026', 'ec-near-surface'),
  ('ev-near-surface-2026', 'ec-geophysics'),
  ('ev-energy-transition-2026', 'ec-energy-transition'),
  ('ev-energy-transition-2026', 'ec-geology'),
  ('ev-co2-storage-2026', 'ec-energy-transition'),
  ('ev-structural-geology-must-knows', 'ec-geology'),
  ('ev-dlp-geothermal', 'ec-energy-transition'),
  ('ev-dlp-geothermal', 'ec-geology'),
  ('ev-annual-conference-2025', 'ec-near-surface'),
  ('ev-annual-conference-2025', 'ec-geophysics'),
  ('ev-annual-conference-2025', 'ec-geology'),
  ('ev-annual-conference-2025', 'ec-energy-transition')
ON CONFLICT ("A", "B") DO NOTHING;

-- 4. DYNAMIC FORM DEFINITIONS
INSERT INTO public."FormDefinition" ("id", "key", "title", "description", "fields")
VALUES
  (
    'form-membership-join',
    'membership-join',
    'AGGE Membership Application',
    'Please provide professional details to finalize your membership registry.',
    '[
      {"name": "academicTitle", "label": "Academic Title", "type": "text", "required": false},
      {"name": "company", "label": "Company / Institution", "type": "text", "required": true},
      {"name": "jobTitle", "label": "Job Title", "type": "text", "required": true},
      {"name": "fieldOfStudy", "label": "Primary Geoscience Field", "type": "select", "required": true, "options": ["Geophysics", "Geology", "Reservoir Engineering", "CCS", "Geothermal", "Other"]},
      {"name": "address", "label": "Mailing Address", "type": "text", "required": true},
      {"name": "city", "label": "City", "type": "text", "required": true},
      {"name": "country", "label": "Country", "type": "text", "required": true}
    ]'::jsonb
  ),
  (
    'form-student-chapter',
    'student-chapter-application',
    'AGGE Student Chapter Application',
    'Apply to establish a local student chapter at your university.',
    '[
      {"name": "universityName", "label": "University Name", "type": "text", "required": true},
      {"name": "departmentName", "label": "Department Name", "type": "text", "required": true},
      {"name": "advisorName", "label": "Faculty Advisor Name", "type": "text", "required": true},
      {"name": "advisorEmail", "label": "Faculty Advisor Email", "type": "email", "required": true},
      {"name": "presidentName", "label": "Student President Name", "type": "text", "required": true},
      {"name": "membersCount", "label": "Initial Student Members count", "type": "number", "required": true},
      {"name": "plannedActivities", "label": "Planned Chapter Activities Summary", "type": "textarea", "required": true}
    ]'::jsonb
  )
ON CONFLICT ("key") DO UPDATE SET
  "title" = EXCLUDED."title",
  "description" = EXCLUDED."description",
  "fields" = EXCLUDED."fields";

-- 5. COURSE CATEGORIES
INSERT INTO public."CourseCategory" ("id", "name", "slug")
VALUES
  ('cc-geology', 'Geology', 'geology'),
  ('cc-geophysics', 'Geophysics', 'geophysics'),
  ('cc-energy-transition', 'Energy Transition', 'energy-transition'),
  ('cc-reservoir', 'Reservoir Characterization', 'reservoir-characterization')
ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name";

-- 6. COURSES
INSERT INTO public."Course" (
  "id", "slug", "title", "description", "courseType", "status",
  "startDate", "endDate", "instructor", "priceMember", "priceNonMember"
)
VALUES
  (
    'course-carbonate',
    'carbonate-reservoir-characterization',
    'Carbonate Reservoir Characterization',
    'Comprehensive geoscientific workflow for carbonate reservoir characterization. Perfect for geology students and professionals.',
    'SELF_PACED',
    'PUBLISHED',
    null,
    null,
    'Dr Laura Galluccio',
    250.00,
    350.00
  ),
  (
    'course-co2-storage',
    'co2-storage-masterclass',
    'AGGE Masterclass CO₂ Storage 2026',
    'An interactive online masterclass on the geological storage of carbon dioxide.',
    'INTERACTIVE_SHORT',
    'PUBLISHED',
    '2026-12-01T09:00:00Z',
    '2026-12-04T17:00:00Z',
    'Multiple experts',
    150.00,
    250.00
  ),
  (
    'course-fwi',
    'full-waveform-inversion',
    'State of the Art in Full Waveform Inversion (FWI)',
    'Comprehensive geophysics online course focusing on theoretical background and modern applications of FWI.',
    'INTERACTIVE_SHORT',
    'PUBLISHED',
    '2026-11-16T09:00:00Z',
    '2026-11-17T17:00:00Z',
    'Prof. Ian Jones',
    180.00,
    280.00
  ),
  (
    'course-structural-geology',
    'structural-geology-must-knows',
    'Structural Geology Must-Knows',
    'Key structural geology concepts and tools essential for reservoir mapping and exploration.',
    'INTERACTIVE_SHORT',
    'PUBLISHED',
    '2026-09-01T09:00:00Z',
    '2026-09-03T17:00:00Z',
    'AGGE Faculty',
    120.00,
    220.00
  ),
  (
    'course-microseismic',
    'microseismic-monitoring',
    'Microseismic Monitoring for the Energy Industry',
    'Applied microseismicity for hydraulic fracturing, geothermal, and carbon storage projects.',
    'INTERACTIVE_SHORT',
    'PUBLISHED',
    '2026-11-18T09:00:00Z',
    '2026-11-19T17:00:00Z',
    'Leo Eisner',
    190.00,
    290.00
  ),
  (
    'course-geostatistical',
    'geostatistical-reservoir-modeling',
    'Geostatistical Reservoir Modeling',
    'Self-paced course on geostatistical techniques for high-resolution reservoir grid properties modeling.',
    'SELF_PACED',
    'PUBLISHED',
    null,
    null,
    'Prof. Dario Grana',
    200.00,
    300.00
  )
ON CONFLICT ("slug") DO UPDATE SET
  "title" = EXCLUDED."title",
  "description" = EXCLUDED."description",
  "priceMember" = EXCLUDED."priceMember",
  "priceNonMember" = EXCLUDED."priceNonMember";

-- Course Categories join
INSERT INTO public."_CourseToCourseCategory" ("A", "B")
VALUES
  ('course-carbonate', 'cc-geology'),
  ('course-co2-storage', 'cc-energy-transition'),
  ('course-fwi', 'cc-geophysics'),
  ('course-structural-geology', 'cc-geology'),
  ('course-microseismic', 'cc-reservoir'),
  ('course-geostatistical', 'cc-geophysics')
ON CONFLICT ("A", "B") DO NOTHING;

-- 7. CMS: ARTICLE CATEGORIES & TAGS
INSERT INTO public."ArticleCategory" ("id", "name", "slug")
VALUES
  ('artcat-announcements', 'Announcements', 'announcements'),
  ('artcat-industry', 'Industry Updates', 'industry-updates')
ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO public."Tag" ("id", "name", "slug")
VALUES
  ('tag-geoscience', 'Geoscience', 'geoscience'),
  ('tag-decarbonization', 'Decarbonization', 'decarbonization')
ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name";

-- 8. CMS: STATIC PAGES
INSERT INTO public."Page" ("id", "slug", "title", "body", "status", "metaTitle", "metaDescription")
VALUES
  (
    'page-legal-disclaimer',
    'legal-disclaimer',
    'Legal Disclaimer',
    '# AGGE Legal Disclaimer

This website and its associated contents are provided as-is without any warranties. The Association of Geoscientists and Engineers (AGGE) does not guarantee the accuracy of data sets, geological maps, or technical publications shared within public domains.',
    'PUBLISHED',
    'AGGE Terms & Legal Disclaimer',
    'Official disclaimer of warranties and limits of liability for the Association of Geoscientists and Engineers.'
  ),
  (
    'page-legal-cookies',
    'legal-cookies',
    'Cookies & Privacy Policy',
    '# Cookies & Privacy Statement

AGGE uses modern session management to maintain authentication and access settings on dashboard utilities. No tracking beacons or intrusive marketing scripts are executed.',
    'PUBLISHED',
    'Cookies Policy - AGGE Portal',
    'Learn how AGGE manages member sessions and secure portals.'
  )
ON CONFLICT ("slug") DO UPDATE SET
  "title" = EXCLUDED."title",
  "body" = EXCLUDED."body";

-- 9. CMS: ARTICLES
INSERT INTO public."Article" (
  "id", "slug", "title", "excerpt", "body", "status", "publishedAt",
  "metaTitle", "metaDescription"
)
VALUES
  (
    'art-near-surface-2026',
    'near-surface-geoscience-2026',
    'EAGE Near Surface Geoscience Conference & Exhibition 2026',
    'AGGE and EAGE are proud to co-host the upcoming Near Surface Geoscience exhibition in Copenhagen, highlighting new geotechnical developments.',
    '## Copenhagen Near Surface Exhibition 2026

We are excited to welcome geophysicists, civil engineers, and environmental scientists to the annual exhibition. This year’s theme focuses on shallow seismic arrays, environmental surveying, and geotechnics for infrastructure pipelines.

### Featured Themes
- High-resolution GPR mapping
- Subsurface water resource contamination checks
- Shallow geothermal drilling monitoring

Registration discounts are available to all active AGGE individual and student members.',
    'PUBLISHED',
    NOW(),
    'Near Surface Geoscience Exhibition 2026',
    'Copenhagen co-hosted exhibition on shallow seismics and geotechnics.'
  ),
  (
    'art-decarbonization',
    'decarbonization-opportunities-young-minds',
    'Energy Transition Opportunities for Young Geoscientists',
    'How carbon capture utilization and storage (CCUS) projects are opening new geophysics career paths.',
    '## The Geoscientist Role in Decarbonization

As global energy strategies transition toward net-zero pathways, young graduates are finding new horizons in reservoir monitoring, carbon sequestration, and geothermal engineering.

Traditional geophysics skillsets—like seismic interpretation, log analysis, and petrophysics—are highly transferable to CCUS projects.

### Key Career Segments
1. CO2 reservoir integrity monitoring
2. Geothermal plume modeling
3. Deep aquifer saline sequestration modeling

Join the AGGE local chapters to connect with energy transition mentors.',
    'PUBLISHED',
    NOW(),
    'Sequestration Careers for Young Geoscientists',
    'Transferring geophysics skills to CCUS and carbon storage projects.'
  )
ON CONFLICT ("slug") DO UPDATE SET
  "title" = EXCLUDED."title",
  "excerpt" = EXCLUDED."excerpt",
  "body" = EXCLUDED."body";

-- Article categories and tags joins
INSERT INTO public."_ArticleToArticleCategory" ("A", "B")
VALUES
  ('art-near-surface-2026', 'artcat-announcements'),
  ('art-decarbonization', 'artcat-industry')
ON CONFLICT ("A", "B") DO NOTHING;

INSERT INTO public."_ArticleToTag" ("A", "B")
VALUES
  ('art-near-surface-2026', 'tag-geoscience'),
  ('art-decarbonization', 'tag-decarbonization')
ON CONFLICT ("A", "B") DO NOTHING;
