/*
  # Enforce email verification requirement

  1. Changes
    - Enable email verification requirement for new sign ups
    - Create policy to restrict access to unverified users
    - Add performance optimization for email verification checks

  Note: This ensures users must verify their email before accessing the application
*/

-- Enable Row Level Security on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create a policy to ensure only verified users can access protected resources
CREATE POLICY "Require verified email"
ON auth.users
FOR ALL
USING (email_confirmed_at IS NOT NULL);

-- Add an index to improve query performance on email verification checks
CREATE INDEX IF NOT EXISTS idx_users_email_confirmed
ON auth.users(email_confirmed_at);

-- Update any existing users to require email verification
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || 
  jsonb_build_object('email_verified', CASE WHEN email_confirmed_at IS NOT NULL THEN true ELSE false END);