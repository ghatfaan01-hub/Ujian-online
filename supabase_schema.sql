-- ==========================================
-- SMK PRIMA UNGGUL - OFFICIAL PRODUCTION SCHEMA
-- ==========================================
-- This script initializes the database for a production environment.
-- It establishes core tables, security policies (RLS), and automation triggers.

-- 1. CORE IDENTITY TABLE
-- Stores profile information linked to Supabase Auth users.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  "fullName" TEXT NOT NULL,
  role TEXT DEFAULT 'siswa' CHECK (role IN ('admin', 'guru', 'staff', 'siswa')),
  department TEXT, -- TKJ, DKV, AK, BC, MPLB, BD, Umum
  nisn TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ATTENDANCE TRACKING
-- Records daily attendance for students and staff.
CREATE TABLE IF NOT EXISTS public.attendance (
  id BIGSERIAL PRIMARY KEY,
  "userId" UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  "targetId" UUID REFERENCES auth.users ON DELETE CASCADE, -- the student being marked
  type TEXT NOT NULL CHECK (type IN ('karyawan', 'siswa')),
  status TEXT NOT NULL CHECK (status IN ('hadir', 'sakit', 'izin', 'alfa')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  location TEXT,
  "fullName" TEXT
);

-- 3. ACADEMIC EXAMINATIONS
-- Defines exam headers and settings.
CREATE TABLE IF NOT EXISTS public.exams (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  kkm INTEGER DEFAULT 70 CHECK (kkm >= 0 AND kkm <= 100),
  duration INTEGER DEFAULT 60 CHECK (duration > 0), -- minutes
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "createdBy" UUID REFERENCES auth.users
);

-- 4. QUESTION BANK
-- Contains questions linked to exams.
CREATE TABLE IF NOT EXISTS public.questions (
  id BIGSERIAL PRIMARY KEY,
  "examId" BIGINT REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of strings: ["Option A", "Option B", ...]
  "correctOption" INTEGER NOT NULL, -- index of the correct option
  difficulty TEXT CHECK (difficulty IN ('mudah', 'sedang', 'sulit'))
);

-- 5. EXAMINATION RESULTS
-- Stores scores and final status of student exam submissions.
CREATE TABLE IF NOT EXISTS public.exam_results (
  id BIGSERIAL PRIMARY KEY,
  "studentId" UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  "examId" BIGINT REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  "studentName" TEXT,
  nisn TEXT,
  "examTitle" TEXT,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  status TEXT NOT NULL CHECK (status IN ('lulus', 'tidak_lulus')),
  "submittedAt" TIMESTAMPTZ DEFAULT NOW(),
  department TEXT
);

-- ==========================================
-- SECURITY ENFORCEMENT (RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Clean existing policies to avoid conflicts
DO $$ 
BEGIN
    -- Profiles
    DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles updatable by owner" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles insertable by system" ON public.profiles;
    -- Attendance
    DROP POLICY IF EXISTS "Attendance view own" ON public.attendance;
    DROP POLICY IF EXISTS "Attendance insert own" ON public.attendance;
    DROP POLICY IF EXISTS "Attendance staff view all" ON public.attendance;
    -- Academic
    DROP POLICY IF EXISTS "Exams viewable by all" ON public.exams;
    DROP POLICY IF EXISTS "Questions viewable by all" ON public.questions;
    DROP POLICY IF EXISTS "Results view own" ON public.exam_results;
    DROP POLICY IF EXISTS "Results insert own" ON public.exam_results;
    DROP POLICY IF EXISTS "Results guru view all" ON public.exam_results;
END $$;

-- 1. Profiles Policies
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Profiles updatable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles insertable by system" ON public.profiles FOR INSERT WITH CHECK (true);

-- 2. Attendance Policies
CREATE POLICY "Attendance view own" ON public.attendance FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "Attendance insert own" ON public.attendance FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Attendance staff view all" ON public.attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'guru', 'staff'))
);

-- 3. Exams & Questions Policies
CREATE POLICY "Exams viewable by all" ON public.exams FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Questions viewable by all" ON public.questions FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Results Policies
CREATE POLICY "Results view own" ON public.exam_results FOR SELECT USING (auth.uid() = "studentId");
CREATE POLICY "Results insert own" ON public.exam_results FOR INSERT WITH CHECK (auth.uid() = "studentId");
CREATE POLICY "Results guru view all" ON public.exam_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'guru'))
);

-- ==========================================
-- DATABASE AUTOMATION (TRIGGERS)
-- ==========================================
-- Logic to sync Supabase Auth users to the public.profiles table instantly.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, "fullName", role, department, nisn)
  VALUES (
    new.id, 
    LOWER(COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))), 
    COALESCE(new.raw_user_meta_data->>'fullName', 'PENGGUNA BARU'), 
    COALESCE(new.raw_user_meta_data->>'role', 'siswa'), 
    new.raw_user_meta_data->>'department', 
    new.raw_user_meta_data->>'nisn'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- BOOTSTRAP DATA (Initial Setup)
-- ==========================================
-- We will use the built-in system-only credentials for initial admin setup if needed.
