/*
  # Remove email verification requirement

  1. Changes
    - Drop the email verification policy
    - Remove the email confirmation index
    - Clean up any existing verification requirements

  Note: This allows users to access the application immediately after registration
  without needing to verify their email address.
*/

-- Drop the email verification policy if it exists
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Require verified email" ON auth.users;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Drop the email confirmation index if it exists
DROP INDEX IF EXISTS auth.idx_users_email_confirmed;