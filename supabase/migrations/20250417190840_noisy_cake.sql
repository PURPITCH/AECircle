/*
  # Create profiles table and policies

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `designation` (text)
      - `picture` (text)
      - `date_of_birth` (date)
      - `nationality` (text)
      - `resident_status` (text)
      - `sex` (text)
      - `height` (integer)
      - `weight` (integer)
      - `medical_conditions` (text[])
      - `basic_training` (text[])
      - `licenses` (jsonb)
      - `certifying_experience` (jsonb)
      - `non_certifying_experience` (jsonb)
      - `drivers_license` (jsonb)
      - `continuous_training` (text[])
      - `company_training` (text[])
      - `has_tool_box` (boolean)
      - `other_training` (text[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on profiles table
    - Add policies for authenticated users to:
      - Read their own profile
      - Create their own profile
      - Update their own profile
*/

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  designation text,
  picture text,
  date_of_birth date,
  nationality text,
  resident_status text,
  sex text CHECK (sex IN ('Male', 'Female', 'Other')),
  height integer CHECK (height BETWEEN 100 AND 300),
  weight integer CHECK (weight BETWEEN 30 AND 200),
  medical_conditions text[],
  basic_training text[],
  licenses jsonb,
  certifying_experience jsonb,
  non_certifying_experience jsonb,
  drivers_license jsonb,
  continuous_training text[],
  company_training text[],
  has_tool_box boolean DEFAULT false,
  other_training text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_profiles_user_id ON public.profiles(id);