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
