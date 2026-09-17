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
