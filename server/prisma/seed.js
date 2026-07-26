import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database details...');

  // 1. Clean existing seedable tables (except Users / RefreshTokens / AuditLogs to preserve active test accounts)
  await prisma.payment.deleteMany({});
  await prisma.eventRegistration.deleteMany({});
  await prisma.courseEnrollment.deleteMany({});
  await prisma.membership.deleteMany({});
  await prisma.membershipPlan.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.eventCategory.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.courseCategory.deleteMany({});
  await prisma.formSubmission.deleteMany({});
  await prisma.formDefinition.deleteMany({});
  await prisma.contactMessage.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.articleCategory.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.page.deleteMany({});

  console.log('Cleaned old records.');

  // 1b. Seed default admin user
  const adminEmail = 'admin@agge.com';
  const adminPasswordHash = '$2b$10$5AusTH4TrhO8Sn4RRg6ByOxL4IpJ.jKvavsFRPTmgiZXG2qwdX/M6'; // hash of 'rootroot'
  
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      firstName: 'AGGE',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log('Seeded default admin user:', adminUser.email);

  // 2. Create Membership Plans
  const individualPlan = await prisma.membershipPlan.create({
    data: {
      name: 'Individual Membership',
      price: 120.00,
      durationMonths: 12,
      description: 'Standard plan for geoscience and engineering professionals. Access to journals and event discounts.',
    },
  });

  const studentPlan = await prisma.membershipPlan.create({
    data: {
      name: 'Student Membership',
      price: 30.00,
      durationMonths: 12,
      description: 'Discounted plan for students and young researchers. Includes mentoring program eligibility.',
    },
  });

  const corporatePlan = await prisma.membershipPlan.create({
    data: {
      name: 'Corporate Membership',
      price: 500.00,
      durationMonths: 12,
      description: 'Plan for corporate teams, agencies, and academic departments. Custom registration quotas.',
    },
  });

  console.log('Seeded membership plans.');

  // 3. Create Event Categories
  const catNearSurface = await prisma.eventCategory.create({
    data: { name: 'Near Surface', slug: 'near-surface' },
  });

  const catEnergyTransition = await prisma.eventCategory.create({
    data: { name: 'Energy Transition', slug: 'energy-transition' },
  });

  const catGeophysics = await prisma.eventCategory.create({
    data: { name: 'Geophysics', slug: 'geophysics' },
  });

  const catGeology = await prisma.eventCategory.create({
    data: { name: 'Geology', slug: 'geology' },
  });

  console.log('Seeded event categories.');

  // 4. Create Events
  await prisma.event.create({
    data: {
      title: 'Near Surface Geoscience Conference & Exhibition 2026',
      slug: 'near-surface-geoscience-2026',
      description: 'Join us in Thessaloniki for the premier near-surface geophysical meeting. Topics include hydrology, environmental engineering, shallow hazard monitoring, and new sensor configurations. Includes technical paper panels and a vibrant exhibition space.',
      eventType: 'CONFERENCE',
      status: 'PUBLISHED',
      startDate: new Date('2026-09-20T09:00:00Z'),
      endDate: new Date('2026-09-24T17:00:00Z'),
      location: 'Thessaloniki, Greece',
      online: false,
      registrationDeadline: new Date('2026-09-10T23:59:59Z'),
      earlyBirdDeadline: new Date('2026-07-31T23:59:59Z'),
      abstractDeadline: new Date('2026-05-15T23:59:59Z'),
      priceMember: 250.00,
      priceNonMember: 350.00,
      organizer: 'AGGE Europe Secretariat',
      imageUrl: 'https://images.unsplash.com/photo-1544006659-f0840aa73740?w=800&auto=format&fit=crop&q=60',
      categories: {
        connect: [{ id: catNearSurface.id }, { id: catGeophysics.id }],
      },
    },
  });

  await prisma.event.create({
    data: {
      title: '7th AGGE Global Energy Transition Conference & Exhibition',
      slug: 'energy-transition-conference-2026',
      description: 'The 7th iteration of our landmark energy transition forum. This year we focus on carbon sequestration site development, geothermal networks exploration, hydrogen storage mechanics, and mining minerals for green storage cells.',
      eventType: 'CONFERENCE',
      status: 'PUBLISHED',
      startDate: new Date('2026-11-02T09:00:00Z'),
      endDate: new Date('2026-11-06T17:00:00Z'),
      location: 'Hannover, Germany',
      online: false,
      registrationDeadline: new Date('2026-10-25T23:59:59Z'),
      earlyBirdDeadline: new Date('2026-09-01T23:59:59Z'),
      abstractDeadline: new Date('2026-06-30T23:59:59Z'),
      priceMember: 220.00,
      priceNonMember: 320.00,
      organizer: 'AGGE Energy SIG',
      imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=60',
      categories: {
        connect: [{ id: catEnergyTransition.id }, { id: catGeology.id }],
      },
    },
  });

  await prisma.event.create({
    data: {
      title: 'AGGE Masterclass CO₂ Storage 2026',
      slug: 'co2-storage-masterclass-2026',
      description: 'An intensive technical workshop covering CCS site screening, modeling, reservoir simulation, integrity monitoring (seismic and gravimetric), and risk registers. Case studies are pulled from mature North Sea operations.',
      eventType: 'WORKSHOP',
      status: 'PUBLISHED',
      startDate: new Date('2026-12-01T10:00:00Z'),
      endDate: new Date('2026-12-04T16:00:00Z'),
      location: 'Online',
      online: true,
      registrationDeadline: new Date('2026-11-28T23:59:59Z'),
      priceMember: 80.00,
      priceNonMember: 120.00,
      organizer: 'AGGE Technical Training',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60',
      categories: {
        connect: [{ id: catEnergyTransition.id }],
      },
    },
  });

  await prisma.event.create({
    data: {
      title: 'Short Course: Structural Geology Must-Knows',
      slug: 'structural-geology-must-knows',
      description: 'This short course goes back to the basics and builds up to advanced modeling. Topics include fault seal analyses, fold-thrust belt kinematics, salt tectonics, and fracturing diagnostics. Essential for structural geologists and geophysicists alike.',
      eventType: 'WORKSHOP',
      status: 'PUBLISHED',
      startDate: new Date('2026-09-01T09:00:00Z'),
      endDate: new Date('2026-09-03T16:00:00Z'),
      location: 'Online',
      online: true,
      registrationDeadline: new Date('2026-08-28T23:59:59Z'),
      priceMember: 70.00,
      priceNonMember: 100.00,
      organizer: 'Learning Geoscience',
      imageUrl: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800&auto=format&fit=crop&q=60',
      categories: {
        connect: [{ id: catGeology.id }],
      },
    },
  });

  await prisma.event.create({
    data: {
      title: 'DLP Webinar: Conceptual-Model Based Exploration of Geothermal Resources',
      slug: 'dlp-geothermal-resources',
      description: 'Our Distinguished Lecturer series presents conceptual model-based workflows for deep and shallow geothermal exploration. Explore geologic structures mapping, thermal logs analysis, and reservoir quality assessments.',
      eventType: 'WEBINAR',
      status: 'PUBLISHED',
      startDate: new Date('2026-08-12T14:00:00Z'),
      endDate: new Date('2026-08-12T15:30:00Z'),
      location: 'Online',
      online: true,
      registrationDeadline: new Date('2026-08-12T13:00:00Z'),
      priceMember: 0.00,
      priceNonMember: 0.00,
      organizer: 'AGGE Communities',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
      categories: {
        connect: [{ id: catEnergyTransition.id }, { id: catGeology.id }],
      },
    },
  });

  await prisma.event.create({
    data: {
      title: 'AGGE Annual Conference 2025',
      slug: 'annual-conference-2025',
      description: 'The historic flagship AGGE Annual Conference from 2025. Brought together thousands of researchers, engineers, and companies to Hannover for keynotes, breakout panels, and networking events. Past archives are open to current active members.',
      eventType: 'CONFERENCE',
      status: 'PUBLISHED',
      startDate: new Date('2025-10-27T09:00:00Z'),
      endDate: new Date('2025-10-31T17:00:00Z'),
      location: 'Hannover, Germany',
      online: false,
      priceMember: 300.00,
      priceNonMember: 400.00,
      organizer: 'AGGE Executive Committee',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
      categories: {
        connect: [{ id: catNearSurface.id }, { id: catGeophysics.id }, { id: catGeology.id }, { id: catEnergyTransition.id }],
      },
    },
  });

  console.log('Seeded mock events details.');

  // 5. Create Dynamic Form Definitions
  await prisma.formDefinition.create({
    data: {
      key: 'membership-join',
      title: 'AGGE Membership Application',
      description: 'Please provide professional details to finalize your membership registry.',
      fields: [
        { name: 'academicTitle', label: 'Academic Title', type: 'text', required: false },
        { name: 'company', label: 'Company / Institution', type: 'text', required: true },
        { name: 'jobTitle', label: 'Job Title', type: 'text', required: true },
        { name: 'fieldOfStudy', label: 'Primary Geoscience Field', type: 'select', required: true, options: ['Geophysics', 'Geology', 'Reservoir Engineering', 'CCS', 'Geothermal', 'Other'] },
        { name: 'address', label: 'Mailing Address', type: 'text', required: true },
        { name: 'city', label: 'City', type: 'text', required: true },
        { name: 'country', label: 'Country', type: 'text', required: true },
      ],
    },
  });

  await prisma.formDefinition.create({
    data: {
      key: 'student-chapter-application',
      title: 'AGGE Student Chapter Application',
      description: 'Apply to establish a local student chapter at your university.',
      fields: [
        { name: 'universityName', label: 'University Name', type: 'text', required: true },
        { name: 'departmentName', label: 'Department Name', type: 'text', required: true },
        { name: 'advisorName', label: 'Faculty Advisor Name', type: 'text', required: true },
        { name: 'advisorEmail', label: 'Faculty Advisor Email', type: 'email', required: true },
        { name: 'presidentName', label: 'Student President Name', type: 'text', required: true },
        { name: 'membersCount', label: 'Initial Student Members count', type: 'number', required: true },
        { name: 'plannedActivities', label: 'Planned Chapter Activities Summary', type: 'textarea', required: true },
      ],
    },
  });

  // 6. Create Course Categories
  const courseCatGeology = await prisma.courseCategory.create({
    data: { name: 'Geology', slug: 'geology' },
  });
  const courseCatGeophysics = await prisma.courseCategory.create({
    data: { name: 'Geophysics', slug: 'geophysics' },
  });
  const courseCatEnergyTransition = await prisma.courseCategory.create({
    data: { name: 'Energy Transition', slug: 'energy-transition' },
  });
  const courseCatReservoir = await prisma.courseCategory.create({
    data: { name: 'Reservoir Characterization', slug: 'reservoir-characterization' },
  });

  // Seed Reference Courses
  await prisma.course.create({
    data: {
      slug: 'carbonate-reservoir-characterization',
      title: 'Carbonate Reservoir Characterization',
      description: 'Comprehensive geoscientific workflow for carbonate reservoir characterization. Perfect for geology students and professionals.',
      courseType: 'SELF_PACED',
      status: 'PUBLISHED',
      startDate: null,
      endDate: null,
      instructor: 'Dr Laura Galluccio',
      priceMember: 250.00,
      priceNonMember: 350.00,
      categories: { connect: [{ id: courseCatGeology.id }] },
    },
  });

  await prisma.course.create({
    data: {
      slug: 'co2-storage-masterclass',
      title: 'AGGE Masterclass CO₂ Storage 2026',
      description: 'An interactive online masterclass on the geological storage of carbon dioxide.',
      courseType: 'INTERACTIVE_SHORT',
      status: 'PUBLISHED',
      startDate: new Date('2026-12-01T09:00:00Z'),
      endDate: new Date('2026-12-04T17:00:00Z'),
      instructor: 'Multiple experts',
      priceMember: 150.00,
      priceNonMember: 250.00,
      categories: { connect: [{ id: courseCatEnergyTransition.id }] },
    },
  });

  await prisma.course.create({
    data: {
      slug: 'full-waveform-inversion',
      title: 'State of the Art in Full Waveform Inversion (FWI)',
      description: 'Comprehensive geophysics online course focusing on theoretical background and modern applications of FWI.',
      courseType: 'INTERACTIVE_SHORT',
      status: 'PUBLISHED',
      startDate: new Date('2026-11-16T09:00:00Z'),
      endDate: new Date('2026-11-17T17:00:00Z'),
      instructor: 'Prof. Ian Jones',
      priceMember: 180.00,
      priceNonMember: 280.00,
      categories: { connect: [{ id: courseCatGeophysics.id }] },
    },
  });

  await prisma.course.create({
    data: {
      slug: 'structural-geology-must-knows',
      title: 'Structural Geology Must-Knows',
      description: 'Key structural geology concepts and tools essential for reservoir mapping and exploration.',
      courseType: 'INTERACTIVE_SHORT',
      status: 'PUBLISHED',
      startDate: new Date('2026-09-01T09:00:00Z'),
      endDate: new Date('2026-09-03T17:00:00Z'),
      instructor: 'AGGE Faculty',
      priceMember: 120.00,
      priceNonMember: 220.00,
      categories: { connect: [{ id: courseCatGeology.id }] },
    },
  });

  await prisma.course.create({
    data: {
      slug: 'microseismic-monitoring',
      title: 'Microseismic Monitoring for the Energy Industry',
      description: 'Applied microseismicity for hydraulic fracturing, geothermal, and carbon storage projects.',
      courseType: 'INTERACTIVE_SHORT',
      status: 'PUBLISHED',
      startDate: new Date('2026-11-18T09:00:00Z'),
      endDate: new Date('2026-11-19T17:00:00Z'),
      instructor: 'Leo Eisner',
      priceMember: 190.00,
      priceNonMember: 290.00,
      categories: { connect: [{ id: courseCatReservoir.id }] },
    },
  });

  await prisma.course.create({
    data: {
      slug: 'geostatistical-reservoir-modeling',
      title: 'Geostatistical Reservoir Modeling',
      description: 'Self-paced course on geostatistical techniques for high-resolution reservoir grid properties modeling.',
      courseType: 'SELF_PACED',
      status: 'PUBLISHED',
      startDate: null,
      endDate: null,
      instructor: 'Prof. Dario Grana',
      priceMember: 200.00,
      priceNonMember: 300.00,
      categories: { connect: [{ id: courseCatGeophysics.id }] },
    },
  });

  // 7. Seed CMS Articles, Categories, Tags, and Pages
  let systemUser = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN', 'EDITOR'] } },
  });
  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: 'system-author@agge.org',
        passwordHash: '$2b$10$dummyhashforseededauthorrecordsnotloginable',
        firstName: 'System',
        lastName: 'Publisher',
        role: 'EDITOR',
      },
    });
  }

  // Categories
  const catAnnouncements = await prisma.articleCategory.create({
    data: { name: 'Announcements', slug: 'announcements' },
  });
  const catIndustry = await prisma.articleCategory.create({
    data: { name: 'Industry Updates', slug: 'industry-updates' },
  });

  // Tags
  const tagGeoscience = await prisma.tag.create({
    data: { name: 'Geoscience', slug: 'geoscience' },
  });
  const tagDecarbonization = await prisma.tag.create({
    data: { name: 'Decarbonization', slug: 'decarbonization' },
  });

  // Pages
  await prisma.page.create({
    data: {
      slug: 'legal-disclaimer',
      title: 'Legal Disclaimer',
      body: '# AGGE Legal Disclaimer\n\nThis website and its associated contents are provided as-is without any warranties. The Association of Geoscientists and Engineers (AGGE) does not guarantee the accuracy of data sets, geological maps, or technical publications shared within public domains.',
      status: 'PUBLISHED',
      metaTitle: 'AGGE Terms & Legal Disclaimer',
      metaDescription: 'Official disclaimer of warranties and limits of liability for the Association of Geoscientists and Engineers.',
    },
  });

  await prisma.page.create({
    data: {
      slug: 'legal-cookies',
      title: 'Cookies & Privacy Policy',
      body: '# Cookies & Privacy Statement\n\nAGGE uses secure HTTP session tokens (JWT cookies) to maintain authentications and access settings on dashboard utilities. No tracking beacons or programmatic advertisement scripts are executed.',
      status: 'PUBLISHED',
      metaTitle: 'Cookies Policy - AGGE Portal',
      metaDescription: 'Learn how AGGE utilizes cookies to manage dashboard profiles and secure portals.',
    },
  });

  // Articles
  await prisma.article.create({
    data: {
      slug: 'near-surface-geoscience-2026',
      title: 'EAGE Near Surface Geoscience Conference & Exhibition 2026',
      excerpt: 'AGGE and EAGE are proud to co-host the upcoming Near Surface Geoscience exhibition in Copenhagen, highlighting new geotechnical developments.',
      body: '## Copenhagen Near Surface Exhibition 2026\n\nWe are excited to welcome geophysicists, civil engineers, and environmental scientists to the annual exhibition. This year’s theme focuses on shallow seismic arrays, environmental surveying, and geotechnics for infrastructure pipelines.\n\n### Featured Themes\n- High-resolution GPR mapping\n- Subsurface water resource contamination checks\n- Shallow geothermal drilling monitoring\n\nRegistration discounts are available to all active AGGE individual and student members.',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: systemUser.id,
      metaTitle: 'Near Surface Geoscience Exhibition 2026',
      metaDescription: 'Copenhagen co-hosted exhibition on shallow seismics and geotechnics.',
      categories: { connect: [{ id: catAnnouncements.id }] },
      tags: { connect: [{ id: tagGeoscience.id }] },
    },
  });

  await prisma.article.create({
    data: {
      slug: 'decarbonization-opportunities-young-minds',
      title: 'Energy Transition Opportunities for Young Geoscientists',
      excerpt: 'How carbon capture utilization and storage (CCUS) projects are opening new geophysics career paths.',
      body: '## The Geoscientist Role in Decarbonization\n\nAs global energy strategies transition toward net-zero pathways, young graduates are finding new horizons in reservoir monitoring, carbon sequestration, and geothermal engineering.\n\nTraditional geophysics skillsets—like seismic interpretation, log analysis, and petrophysics—are highly transferable to CCUS projects.\n\n### Key Career Segments\n1. CO2 reservoir integrity monitoring\n2. Geothermal plume modeling\n3. Deep aquifer saline sequestration modeling\n\nJoin the AGGE local chapters to connect with energy transition mentors.',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: systemUser.id,
      metaTitle: 'Sequestration Careers for Young Geoscientists',
      metaDescription: 'Transferring geophysics skills to CCUS and carbon storage projects.',
      categories: { connect: [{ id: catIndustry.id }] },
      tags: { connect: [{ id: tagDecarbonization.id }] },
    },
  });

  console.log('Seeded dynamic forms, education courses, and CMS articles.');
  console.log('Database seeding successfully finished! 🚀');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
