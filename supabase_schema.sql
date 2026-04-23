-- SMK Prima Unggul Database Schema (PostgreSQL for Supabase)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  fullName TEXT NOT NULL,
  role TEXT DEFAULT 'siswa', -- admin, guru, staff, siswa
  department TEXT, -- TKJ, DKV, AK, BC, MPLB, BD, Umum
  nisn TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id BIGSERIAL PRIMARY KEY,
  userId UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  targetId UUID REFERENCES auth.users ON DELETE CASCADE, -- if guru marks for siswa
  type TEXT NOT NULL, -- karyawan, siswa
  status TEXT NOT NULL, -- hadir, sakit, izin, alfa
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  location TEXT,
  fullName TEXT
);

-- 3. Exams Table
CREATE TABLE IF NOT EXISTS public.exams (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  kkm INTEGER DEFAULT 70,
  duration INTEGER DEFAULT 60, -- minutes
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  createdBy UUID REFERENCES auth.users
);

-- 4. Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
  id BIGSERIAL PRIMARY KEY,
  examId BIGINT REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  options JSONB NOT NULL, -- ["A", "B", "C", "D"]
  correctOption INTEGER NOT NULL,
  difficulty TEXT -- gampang, sulit
);

-- 5. Exam Results Table
CREATE TABLE IF NOT EXISTS public.exam_results (
  id BIGSERIAL PRIMARY KEY,
  studentId UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  examId BIGINT REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  studentName TEXT,
  nisn TEXT,
  examTitle TEXT,
  score INTEGER NOT NULL,
  status TEXT NOT NULL, -- lulus, tidak_lulus
  submittedAt TIMESTAMPTZ DEFAULT NOW(),
  department TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Adjust as needed)
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view their own attendance" ON attendance FOR SELECT USING (auth.uid() = userId);
CREATE POLICY "Users can create their own attendance" ON attendance FOR INSERT WITH CHECK (auth.uid() = userId);
CREATE POLICY "Gurus can view all attendance" ON attendance FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'guru', 'staff')));

CREATE POLICY "Anyone authenticated can view exams" ON exams FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone authenticated can view questions" ON questions FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own exam results" ON exam_results FOR SELECT USING (auth.uid() = studentId);
CREATE POLICY "Users can insert their own results" ON exam_results FOR INSERT WITH CHECK (auth.uid() = studentId);
CREATE POLICY "Gurus can view all results" ON exam_results FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'guru')));
