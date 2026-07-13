# AGGE Reference Analysis (EAGE.org)

> Analysis based on crawled reference files in `eage.org-crawled/` and the supplemental sitemap at `https://eage.org/sitemap.xml`.  
> Purpose: inform AGGE information architecture and functional requirements — **not** a visual clone.

---

## Website Overview

EAGE (European Association of Geoscientists & Engineers) operates a large **membership-driven professional association website** built on WordPress. The site serves as:

- A **public marketing and information hub** for geoscience/engineering professionals
- An **events discovery and registration gateway** (often linking to external registration platforms such as `eage.eventsair.com`)
- A **news and announcements CMS** (`/eage_news/`)
- An **education course catalog** with filterable calendars (Learning Geoscience)
- A **communities portal** for technical special interest groups and local chapters
- A **media/publishing hub** (journals, newsletters, EarthDoc, bookshop)
- A **membership lifecycle portal** (join, renew, benefits, student programs)

AGGE should preserve this **functional breadth** while delivering a **modern, simplified UX** and a unified custom stack (React + Express + PostgreSQL).

---

## Page Structure

### Top-Level Public Sections (inferred from sitemaps + homepage)

| Section | Reference paths | AGGE equivalent |
|---------|-----------------|-----------------|
| Home | `/` | `/` |
| About | `/about-us`, `/about-us/our-team`, `/about-us/our-history`, `/about_eage/*` | `/about`, `/about/team`, `/about/history` |
| Membership | `/membership`, `/membership/welcome`, `/membership/benefits`, `/membership/membership-types` | `/membership`, `/membership/join`, `/membership/benefits`, `/membership/types` |
| Events | `/events`, `/events/conferences`, `/events/workshops`, `/events/webinars`, `/events/calendar-of-events`, `/events/calendar-of-online-events`, `/events/calendar-of-past-events` | `/events`, `/events/conferences`, `/events/workshops`, `/events/webinars`, `/events/calendar` |
| News | `/news`, `/news/press-releases`, `/eage_news/*`, `/eage_news/eage-news-archive` | `/news`, `/news/press-releases`, `/news/:slug`, `/news/archive` |
| Education | `/education/calendar-*`, Learning Geoscience course listings | `/education`, `/education/courses`, `/education/calendar` |
| Communities | `/communities/*` (20+ technical communities + local chapters) | `/communities`, `/communities/:slug` |
| Students | `/students/student-community/` | `/students` |
| Media & Publishing | `/media/journals`, `/media/earthdoc`, `/media/online-bookshop`, etc. | `/media`, `/media/journals`, `/media/publications` |
| Services | `/services`, `/services/training`, `/services/consulting` | `/services`, `/services/training`, `/services/consulting` |
| Contact | `/contact-us`, `/contact-us/media-inquiries`, `/contact-us/customer-support` | `/contact`, `/contact/media`, `/contact/support` |
| Legal | `/disclaimer`, `/cookies` | `/legal/disclaimer`, `/legal/cookies` |

### Homepage Content Blocks (reference)

1. **Hero carousel** — featured conferences/events with dates, locations, CTA (Register / Learn more)
2. **Floating events calendar shortcut**
3. **News feed** — latest articles with featured image, date, excerpt, “Read more”
4. **Membership CTA** — “Become a member” / renewal prompts
5. **Value pillars** — Students, Learning Geoscience, Communities cards
6. **Cross-promotion** — external platforms (e.g. First Break Online)

---

## Main Navigation (proposed for AGGE)

Primary nav (modernized from reference IA):

```
Home | About | Membership | Events | Education | Communities | News | Media | Contact
                                              [Login] [Join AGGE]
```

Secondary / footer nav:

- Students & Early Career
- Services (Training, Consulting)
- Local Chapters
- Legal (Privacy, Cookies, Disclaimer)
- Social links

Authenticated member nav (future):

```
My Dashboard | My Events | My Membership | Profile | Logout
```

Admin nav (future):

```
Dashboard | Content | Events | Users | Memberships | Forms | Payments | Settings
```

---

## Page Hierarchy

```
/
├── about/
│   ├── team
│   ├── history
│   └── governance (ballot, AGMM — from reference)
├── membership/
│   ├── join
│   ├── renew
│   ├── benefits
│   └── types (individual, student, corporate)
├── events/
│   ├── calendar (upcoming | online | past)
│   ├── conferences/
│   │   └── :slug
│   ├── workshops/
│   │   └── :slug
│   ├── webinars/
│   │   └── :slug
│   └── register/:eventSlug
├── education/
│   ├── courses (filterable catalog)
│   └── calendar
├── communities/
│   ├── index (all communities)
│   ├── local-chapters
│   └── :slug
├── students/
├── news/
│   ├── archive
│   ├── press-releases
│   └── :slug
├── media/
│   ├── journals
│   ├── newsletters
│   └── publications
├── services/
├── contact/
└── admin/ (protected)
```

---

## Content Categories

### News (`/eage_news/`)

- Association announcements (membership fees, renewals, AGMM)
- Community updates
- Education & course launches
- Student competitions & awards
- Journal call-for-papers
- Policy statements
- Event recaps
- In memoriam / humanitarian statements

Each article: title, slug, publish date, featured image, excerpt, rich body, optional categories/tags, author, SEO metadata.

### Events

Types observed:

- Conferences & exhibitions (multi-day, location-based)
- Workshops
- Webinars / Distinguished Lecturer Webinars
- Interactive Online Short Courses
- Self-paced online courses
- Regional registration flows (APAC, Europe, LATAM, MEA)

Event metadata: title, dates, location, event type, registration URL/deadline, early-bird pricing windows, abstract submission deadlines, organizer, keywords.

### Education / Courses

Filter dimensions from reference calendars:

- **Event type**: Self-paced, DLP Webinar, Extensive Online, E-Lecture, Interactive Short Course, Partner Course, How-to Video
- **Category**: Data Science, Energy Transition, Engineering, Geology, Geophysics, Near Surface, Reservoir Characterization, Training & Development
- **Time**: Month, Year, On-demand
- **Search fields**: title, instructor, keywords, organizer

### Communities

Technical communities (sample from sitemap):

- Geomechanics, Geochemistry, CCS, Geothermal, Wind Energy, Hydrogen & Energy Storage
- AI, Seismic Acquisition/Interpretation, Geohazards, Hydrogeophysics, UAV
- Young Professionals, Women in Geoscience & Engineering
- Local Chapters, Mentoring Programme, EU Affairs

### Media

- Journals (Petroleum Geoscience, Geophysical Prospecting, Basin Research, Geoenergy)
- Newsletters (Digital, NSG, First Break)
- EarthDoc publishing platform
- Online bookshop
- Media gallery & partners

---

## User Journeys

### 1. Prospective member discovers AGGE

Home → Membership benefits → Membership types → Join form → Payment → Welcome / member dashboard

### 2. Existing member renews

Login → Renewal notice (news/email) → Membership renew → Payment confirmation

### 3. Event attendee registers

Home/Events calendar → Event detail → Register (internal form or external link) → Confirmation email

### 4. Student engages with community

Students page → Student chapter / competition news → Application form → Admin review

### 5. Professional finds training

Education calendar → Filter by category/type → Course detail → Register

### 6. Content consumer reads news

Home news feed → Article detail → Related articles / archive

### 7. Community member explores SIG

Communities index → Community landing page → Resources / events / contact

### 8. Admin publishes content

Admin login → CMS → Create/edit news or event → Publish → Appears on public site

---

## Event System (reference behavior)

- **Unified calendar** with views: all events, online-only, past events
- **Event listing pages** by type (conferences, workshops)
- **Individual event pages** with rich content, dates, location, registration CTA
- **External registration** integration (reference uses EventsAir — AGGE may internalize later)
- **Regional registration** pages (TCS by region)
- **Terms & conditions** per event category
- **Environmental policy** and other event-related static pages

AGGE modules needed:

- Event CRUD (admin)
- Calendar API with filters (type, date range, location, keyword)
- Registration records (even if payment is phase 2)
- iCal/export (future enhancement)

---

## Membership System (reference behavior)

- Public **benefits** and **welcome** pages
- **Membership types** (individual, student, corporate inferred)
- **Annual renewal cycle** with fee announcements via news
- **Student membership** and chapter applications
- **Member-only content** (some webinars/events reference member access)
- **360° benefits** marketing language — bundled access to education, events, publications

AGGE modules needed:

- User accounts with roles
- Membership plans & pricing tiers
- Subscription lifecycle (active, expired, pending)
- Renewal reminders
- Member profile & benefits entitlements
- Admin membership management

---

## Forms (identified & anticipated)

| Form | Purpose | Where referenced |
|------|---------|------------------|
| Membership join | New member signup | `/membership/welcome` |
| Membership renew | Annual renewal | News articles, member area |
| Event registration | Conference/workshop signup | Event pages, external EventsAir |
| Course registration | Education enrollment | Education calendar |
| Contact / support | General inquiries | `/contact-us/*` |
| Media inquiries | Press contact | `/contact-us/media-inquiries` |
| Student chapter application | Chapter setup | News: student chapters |
| Competition submission | Student awards | News articles |
| Community engagement | Questions, mentoring | `/communities/engage-question` |
| Newsletter subscribe | Stay connected | `/media/newsletters_stay-connected` |
| Admin CMS forms | Content management | Admin dashboard (future) |

All public forms should use **Zod validation** server-side; sensitive flows require authentication.

---

## News / Content Structure

**Content model:**

```
Article
├── id, slug, title
├── excerpt, body (rich text / blocks)
├── featuredImage
├── publishedAt, status (draft | published | archived)
├── category, tags
├── authorId
└── seo (metaTitle, metaDescription)
```

**Listing features:**

- Paginated archive
- Featured/sticky posts on homepage
- Category filtering
- Full-text search (future)

Reference has **200+ news articles** dating back years — AGGE CMS must support archival content and slug-based URLs.

---

## Required Admin Functionality

### Phase 1 (foundation — later implementation)

- Admin authentication (JWT + HTTP-only cookies)
- Role-based access (super-admin, editor, event-manager)

### Phase 2 (CMS)

- Create/edit/publish news articles
- Manage pages (about, legal, landing pages)
- Media library (Multer + local filesystem)
- SEO fields per content item

### Phase 3 (Events & Education)

- Event CRUD with calendar scheduling
- Course catalog management
- Registration form builder / field configuration
- Export registrants (CSV)

### Phase 4 (Membership & Payments)

- Membership plan configuration
- Member directory & status management
- Payment transaction logs
- Renewal campaign tools

### Phase 5 (Communities & Programs)

- Community page management
- Student program / competition administration
- Local chapter listings

### System

- User management
- Audit log (who changed what)
- Site settings (contact info, social links, feature flags)

---

## User Roles

| Role | Access |
|------|--------|
| **Guest** | Public pages, event/news browsing, contact forms |
| **Member** | Member dashboard, renew membership, registered events, member-only content |
| **Student member** | Student resources + member benefits |
| **Editor** | CMS: news, pages, media |
| **Event manager** | Events, registrations, calendars |
| **Admin** | Full system access except super-admin settings |
| **Super admin** | Users, roles, system config, payments |

---

## Required Modules (AGGE platform)

1. **Core** — routing, layouts, SEO, error pages
2. **Auth** — JWT, cookies, login/logout, password reset
3. **Users** — profiles, roles, preferences
4. **Membership** — plans, subscriptions, benefits
5. **Events** — listings, detail, calendar, registration
6. **Education** — course catalog, filters, enrollment
7. **News/CMS** — articles, pages, media library
8. **Communities** — SIG pages, local chapters
9. **Forms** — dynamic submissions, validation
10. **Payments** — checkout, invoices (later phase)
11. **Admin dashboard** — unified management UI
12. **Notifications** — email hooks (later phase)
13. **Search** — cross-content search (later phase)

---

## Suggested Database Entities

```
User
Role
UserRole (or role enum on User)

MembershipPlan
Membership
Payment (future)

Event
EventCategory
EventRegistration

Course
CourseCategory
CourseEnrollment

Article (News)
ArticleCategory
Tag
ArticleTag

Page (CMS static pages)
MediaAsset

Community
CommunityMember (optional)

FormDefinition
FormSubmission

ContactMessage

SiteSetting
AuditLog
RefreshToken (for JWT rotation)
```

### Key relationships

- `User` 1—* `Membership`
- `User` 1—* `EventRegistration`
- `Event` 1—* `EventRegistration`
- `Article` *—* `Tag`
- `Article` *—1 `User` (author)
- `MediaAsset` *—1 `User` (uploader)

---

## Suggested API Structure

Base URL: `/api`

### Health & meta

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| GET | `/health/db` | Database connectivity (future) |

### Auth (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Issue JWT cookie |
| POST | `/logout` | Clear session |
| GET | `/me` | Current user |
| POST | `/refresh` | Refresh token |

### Users (`/api/users`) — admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List users |
| GET | `/:id` | User detail |
| PATCH | `/:id` | Update user |
| DELETE | `/:id` | Deactivate user |

### Membership (`/api/membership`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/plans` | List plans |
| POST | `/subscribe` | Start membership |
| POST | `/renew` | Renew membership |
| GET | `/me` | Current membership status |

### Events (`/api/events`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List/filter events |
| GET | `/calendar` | Calendar view data |
| GET | `/:slug` | Event detail |
| POST | `/` | Create event (admin) |
| PATCH | `/:id` | Update event (admin) |
| DELETE | `/:id` | Delete event (admin) |
| POST | `/:id/register` | Register for event |

### Education (`/api/courses`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Filterable course catalog |
| GET | `/:slug` | Course detail |
| POST | `/` | Create course (admin) |
| POST | `/:id/enroll` | Enroll in course |

### News (`/api/news`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Paginated articles |
| GET | `/archive` | Full archive |
| GET | `/:slug` | Article detail |
| POST | `/` | Create article (admin) |
| PATCH | `/:id` | Update article (admin) |
| DELETE | `/:id` | Delete article (admin) |

### Communities (`/api/communities`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List communities |
| GET | `/:slug` | Community detail |
| POST | `/` | Create (admin) |
| PATCH | `/:id` | Update (admin) |

### Pages (`/api/pages`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:slug` | Static CMS page |
| POST | `/` | Create page (admin) |
| PATCH | `/:id` | Update page (admin) |

### Media (`/api/media`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List assets (admin) |
| POST | `/upload` | Upload file (admin, Multer) |
| DELETE | `/:id` | Remove asset (admin) |

### Forms (`/api/forms`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:key` | Form schema |
| POST | `/:key/submit` | Submit form |
| GET | `/submissions` | List submissions (admin) |

### Contact (`/api/contact`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | General contact |
| POST | `/media` | Media inquiry |
| POST | `/support` | Customer support |

---

## AGGE vs EAGE — Design Direction

| Aspect | EAGE reference | AGGE target |
|--------|----------------|-------------|
| Visual design | WordPress theme, slider-heavy | Modern, clean, accessible UI |
| Navigation | Deep mega-menu | Simplified primary nav + search |
| Registration | External EventsAir links | Unified registration (phased) |
| News | WordPress posts | Custom CMS with block editor (phased) |
| Performance | Heavy plugins/sliders | Lightweight React SPA |
| Auth | External/member portal | Integrated JWT auth |

---

## Implementation Phases (agreed roadmap)

1. Database design
2. Authentication
3. User system
4. Admin dashboard
5. Events
6. Registration forms
7. Payments
8. Calendar
9. CMS
10. Deployment

**Current phase:** Project initialization only — monorepo scaffold, health check, placeholder homepage.

---

## Reference File Index

| File | Contents |
|------|----------|
| `eage.org_.md` | Homepage — hero, news, membership CTA, pillar cards |
| `eage.org_events-sitemap.xml.md` | Event section URLs |
| `eage.org_events_environmental-policy_.md` | Sample event subpage |
| `eage.org_eage_news-sitemap.xml.md` | 200+ news article URLs |
| `eage.org_communities-sitemap.xml.md` | Community/chapter URLs |
| `eage.org_media-sitemap.xml.md` | Media & publishing URLs |
| `eage.org_education_calendar-*.md` | Education calendar tables & filters |
| `eage.org_page-sitemap.xml.md` | Static pages (digital, energy transition, disclaimer) |
| `sitemap.xml` | High-level IA snapshot (contact, membership, events, news, services, about) |
