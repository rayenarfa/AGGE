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
