-- Clear all existing templates and sync data
DELETE FROM templates;
DELETE FROM sync_status;

-- Clear storage objects from both buckets
DELETE FROM storage.objects WHERE bucket_id IN ('templates', 'templates-src');