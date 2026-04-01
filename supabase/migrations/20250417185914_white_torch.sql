/*
  # Delete specific user

  1. Changes
    - Delete user with email 'shamilbread@gmail.com' from auth.users table
    - Clean up any related data
*/

DO $$
BEGIN
  DELETE FROM auth.users
  WHERE email = 'shamilbread@gmail.com';
END $$;