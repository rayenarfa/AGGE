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
