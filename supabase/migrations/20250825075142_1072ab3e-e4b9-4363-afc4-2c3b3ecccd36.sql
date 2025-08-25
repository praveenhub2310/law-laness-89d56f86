-- Fix demo lawyer user role in profiles table
UPDATE profiles 
SET role = 'advocate' 
WHERE id = '0ec33c6a-c57e-4198-9791-17e9fe900409' AND email = 'lawyer@akralegal.com';