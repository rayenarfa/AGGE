# Task 09: CMS (Content Management System)

## Status
- **Status**: Completed
- **Completion Date**: 2026-07-10
- **Assigned to**: AI Assistant / Developer

## Objective
Enable editors and administrators to publish news articles, modify static pages, and upload media assets.

## Requirements & Scope
1. **News/Article Management**:
   - CRUD endpoints for `Article`, `ArticleCategory`, and `Tag`.
   - Support draft, publish, and archive status lifecycles.
   - SEO metadata fields (meta title, description) per article.
2. **Static Page Content**:
   - Editable blocks for static pages like Legal, Privacy, and About Us.
3. **Media Library (File Uploads)**:
   - Configure local disk storage uploading via `multer` on the server.
   - Track upload metadata in the `MediaAsset` table.
4. **Client Layouts**:
   - Rich news listing archive with category filtering and sticky homepage items.
   - Article detail rendering.

## Completed Work
- ✅ `seed.js` updated — article categories, tags, legal page blocks, and 2 seeded geoscience articles
- ✅ `cmsController.js` — Article CRUD, page block upsert, media asset upload/list/delete with audit logging
- ✅ `cmsRoutes.js` — Multer disk storage, role-restricted endpoints for all CMS resources
- ✅ `server/src/index.js` — CMS routes registered, `/uploads` static folder served
- ✅ `client/src/services/cms.js` — Axios helpers for articles, page blocks, media assets
- ✅ `NewsPages.jsx` — Dynamic article listings, **category filter sidebar with keyword search**, press releases, and full-screen article detail with ReactMarkdown rendering, tags, and hero images
- ✅ `NewsCard.jsx` — Featured image display with hover zoom, emerald category badge
- ✅ `LegalPages.jsx` — Fetches disclaimer and cookies text blocks from DB (falls back to mock)
- ✅ `AdminDashboardPage.jsx` — Full Content (CMS) workspace: articles CRUD table + modal editor, static page block editor, media library with upload and delete

