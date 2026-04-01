/*
  # Delete user from auth schema
  
  1. Changes
    - Delete user from auth.users table
*/

DO $$
BEGIN
  DELETE FROM auth.users;
END $$;