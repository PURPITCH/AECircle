/*
  # Enable email verification

  1. Changes
    - Enable email verification requirement for new sign ups
    - Users must verify their email before accessing the application

  Note: Email verification settings are managed through Supabase's Auth settings
  in the dashboard. This migration ensures proper database setup for verified users.
*/

-- Create a policy to ensure only verified users can access protected resources
CREATE POLICY "Require verified email"
ON auth.users
FOR ALL
USING (email_confirmed_at IS NOT NULL);

-- Add an index to improve query performance on email verification checks
CREATE INDEX IF NOT EXISTS idx_users_email_confirmed
ON auth.users(email_confirmed_at);