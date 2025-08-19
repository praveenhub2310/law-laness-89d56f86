-- Check all functions and their search_path settings
SELECT 
  schemaname,
  functionname,
  definition
FROM pg_functions 
WHERE functionname = 'handle_new_user' 
OR functionname LIKE '%user%';