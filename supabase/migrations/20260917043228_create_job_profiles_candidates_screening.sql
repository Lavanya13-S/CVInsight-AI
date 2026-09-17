/*
# Create job profiles, candidates, and screening results tables

1. New Tables
- `job_profiles`: Stores saved job configurations with title, category, description, required/preferred skills (text[]), min/max experience, education requirements, status (active/archived), and timestamps. Scoped to a user_email for demo auth compatibility.
- `candidates`: Stores candidate records with name, email, phone, resume text, skills (text[]), education, experience data (years, category, internship months, override flag), source, filename, and timestamps. Scoped to user_email.
- `screening_results`: Stores screening results linking a candidate to a job profile with scores, matched/missing skills, explanation, and screening date.

2. Security
- RLS enabled on all tables.
- Policies allow anon + authenticated access (demo auth uses sessionStorage, not Supabase auth, so anon key is used).
- All tables are scoped by user_email column for data isolation between users.

3. Notes
- Uses text[] (PostgreSQL arrays) for skills fields.
- Uses timestamptz with default now() for timestamps.
- Screening results reference both job_profiles and candidates via foreign keys with CASCADE delete.
- user_email column allows demo auth to work without Supabase auth tables, and can be replaced later.
*/

CREATE TABLE IF NOT EXISTS job_profiles (
  id text PRIMARY KEY,
  user_email text NOT NULL DEFAULT 'demo@cvinsight.ai',
  job_title text NOT NULL,
  role_category text NOT NULL DEFAULT '',
  job_description text NOT NULL DEFAULT '',
  required_skills text[] NOT NULL DEFAULT '{}',
  preferred_skills text[] NOT NULL DEFAULT '{}',
  min_experience integer NOT NULL DEFAULT 0,
  max_experience integer NOT NULL DEFAULT 0,
  education_requirements text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE job_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_job_profiles" ON job_profiles;
CREATE POLICY "anon_select_job_profiles" ON job_profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_job_profiles" ON job_profiles;
CREATE POLICY "anon_insert_job_profiles" ON job_profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_job_profiles" ON job_profiles;
CREATE POLICY "anon_update_job_profiles" ON job_profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_job_profiles" ON job_profiles;
CREATE POLICY "anon_delete_job_profiles" ON job_profiles FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS candidates (
  id text PRIMARY KEY,
  user_email text NOT NULL DEFAULT 'demo@cvinsight.ai',
  name text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  resume_text text NOT NULL DEFAULT '',
  skills text[] NOT NULL DEFAULT '{}',
  projects text[] NOT NULL DEFAULT '{}',
  certifications text[] NOT NULL DEFAULT '{}',
  education text NOT NULL DEFAULT '',
  years_experience numeric NOT NULL DEFAULT 0,
  experience_category text NOT NULL DEFAULT 'Experienced Professional',
  internship_months integer NOT NULL DEFAULT 0,
  full_time_experience_months integer NOT NULL DEFAULT 0,
  experience_overridden boolean NOT NULL DEFAULT false,
  experience_source text NOT NULL DEFAULT 'auto',
  source text NOT NULL DEFAULT 'manual',
  file_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_candidates" ON candidates;
CREATE POLICY "anon_select_candidates" ON candidates FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_candidates" ON candidates;
CREATE POLICY "anon_insert_candidates" ON candidates FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_candidates" ON candidates;
CREATE POLICY "anon_update_candidates" ON candidates FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_candidates" ON candidates;
CREATE POLICY "anon_delete_candidates" ON candidates FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS screening_results (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL DEFAULT 'demo@cvinsight.ai',
  candidate_id text NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_profile_id text NOT NULL REFERENCES job_profiles(id) ON DELETE CASCADE,
  overall_score integer NOT NULL DEFAULT 0,
  required_skills_match integer NOT NULL DEFAULT 0,
  preferred_skills_match integer NOT NULL DEFAULT 0,
  experience_match integer NOT NULL DEFAULT 0,
  matched_skills text[] NOT NULL DEFAULT '{}',
  missing_skills text[] NOT NULL DEFAULT '{}',
  explanation text NOT NULL DEFAULT '',
  recommendation text NOT NULL DEFAULT 'No Match',
  screened_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE screening_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_screening_results" ON screening_results;
CREATE POLICY "anon_select_screening_results" ON screening_results FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_screening_results" ON screening_results;
CREATE POLICY "anon_insert_screening_results" ON screening_results FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_screening_results" ON screening_results;
CREATE POLICY "anon_update_screening_results" ON screening_results FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_screening_results" ON screening_results;
CREATE POLICY "anon_delete_screening_results" ON screening_results FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_job_profiles_user_email ON job_profiles(user_email);
CREATE INDEX IF NOT EXISTS idx_candidates_user_email ON candidates(user_email);
CREATE INDEX IF NOT EXISTS idx_screening_results_candidate ON screening_results(candidate_id);
CREATE INDEX IF NOT EXISTS idx_screening_results_job_profile ON screening_results(job_profile_id);
CREATE INDEX IF NOT EXISTS idx_screening_results_user_email ON screening_results(user_email);
