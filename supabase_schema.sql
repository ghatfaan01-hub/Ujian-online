-- ==========================================
-- SMK PRIMA UNGGUL - MASTER DATABASE SCHEMA
-- ==========================================
-- Jalankan kode ini di Supabase SQL Editor untuk memulai dari awal (Clean Slate)

-- 1. BERSIHKAN (Opsional: Hapus jika ingin benar-benar kosong)
-- DROP TABLE IF EXISTS public.exam_results CASCADE;
-- DROP TABLE IF EXISTS public.questions CASCADE;
-- DROP TABLE IF EXISTS public.exams CASCADE;
-- DROP TABLE IF EXISTS public.attendance CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. TABEL PROFIL (Inti Identitas)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  "fullName" TEXT NOT NULL,
  role TEXT DEFAULT 'siswa', -- admin, guru, staff, siswa
  department TEXT, -- TKJ, DKV, AK, BC, MPLB, BD, Umum
  nisn TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL ABSENSI
CREATE TABLE IF NOT EXISTS public.attendance (
  id BIGSERIAL PRIMARY KEY,
  "userId" UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  "targetId" UUID REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL, 
  status TEXT NOT NULL, -- hadir, sakit, izin, alfa
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  location TEXT,
  "fullName" TEXT
);

-- 4. TABEL UJIAN & SOAL
CREATE TABLE IF NOT EXISTS public.exams (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  kkm INTEGER DEFAULT 70,
  duration INTEGER DEFAULT 60,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "createdBy" UUID REFERENCES auth.users
);

CREATE TABLE IF NOT EXISTS public.questions (
  id BIGSERIAL PRIMARY KEY,
  "examId" BIGINT REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  options JSONB NOT NULL,
  "correctOption" INTEGER NOT NULL,
  difficulty TEXT
);

-- 5. TABEL HASIL UJIAN
CREATE TABLE IF NOT EXISTS public.exam_results (
  id BIGSERIAL PRIMARY KEY,
  "studentId" UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  "examId" BIGINT REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  "studentName" TEXT,
  nisn TEXT,
  "examTitle" TEXT,
  score INTEGER NOT NULL,
  status TEXT NOT NULL,
  "submittedAt" TIMESTAMPTZ DEFAULT NOW(),
  department TEXT
);

-- ==========================================
-- 6. KEAMANAN (Row Level Security)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- BERSIHKAN POLICIES LAMA
DROP POLICY IF EXISTS "Profiles are viewable by all auth" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Attendance view own" ON attendance;
DROP POLICY IF EXISTS "Attendance insert own" ON attendance;
DROP POLICY IF EXISTS "Attendance guru view all" ON attendance;
DROP POLICY IF EXISTS "Exams view all" ON exams;
DROP POLICY IF EXISTS "Questions view all" ON questions;
DROP POLICY IF EXISTS "Results view own" ON exam_results;
DROP POLICY IF EXISTS "Results insert own" ON exam_results;
DROP POLICY IF EXISTS "Results guru view all" ON exam_results;

-- POLICIES BARU (Kuat & Stabil)
CREATE POLICY "Profiles are viewable by all auth" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "System can insert profiles" ON profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Attendance view own" ON attendance FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "Attendance insert own" ON attendance FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Attendance guru view all" ON attendance FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'guru')));

CREATE POLICY "Exams view all" ON exams FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Questions view all" ON questions FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Results view own" ON exam_results FOR SELECT USING (auth.uid() = "studentId");
CREATE POLICY "Results insert own" ON exam_results FOR INSERT WITH CHECK (auth.uid() = "studentId");
CREATE POLICY "Results guru view all" ON exam_results FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'guru')));

-- ==========================================
-- 7. OTOMATISASI (Trigger Profil Otomatis)
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, "fullName", role, department, nisn)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)), 
    COALESCE(new.raw_user_meta_data->>'fullName', 'Pengguna Baru'), 
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
