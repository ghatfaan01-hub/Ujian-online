import { supabase } from '../lib/supabase';

export async function createTestAccounts() {
  const testUsers = [
    { username: 'admin', password: 'password123', role: 'admin', fullName: 'Administrator Utama', department: 'Umum' },
    { username: 'guru_tkj', password: 'password123', role: 'guru', fullName: 'Bpk. Wijaya, S.Kom', department: 'TKJ' },
    { username: 'siswa_tkj', password: 'password123', role: 'siswa', fullName: 'Budi Santoso', department: 'TKJ', nisn: '1122334455' },
    { username: 'siswa_dkv', password: 'password123', role: 'siswa', fullName: 'Siti Aminah', department: 'DKV', nisn: '5544332211' },
    { username: 'siswa', password: 'pu123', role: 'siswa', fullName: 'Siswa Percobaan', department: 'TKJ', nisn: '0011223344', customEmail: 'siswa@smkpu.id' }
  ];

  for (const u of testUsers) {
    try {
      const email = u.customEmail || `${u.username}@smkpu.id`;
      
      // 1. Sign up user (or get existing)
      const { data, error } = await supabase.auth.signUp({
        email,
        password: u.password,
        options: {
          data: {
            username: u.username,
            fullName: u.fullName,
            role: u.role,
            department: u.department,
            nisn: u.nisn || ''
          }
        }
      });

      if (error && !error.message.includes('already registered')) {
        throw error;
      }

      // 2. Double check profile exists (Repair logic if trigger failed or didn't exist)
      // We'll sign in temporarily or just use the user ID if we have it
      const userId = data.user?.id;
      
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();
        
        if (!profile) {
          console.log(`Repairing missing profile for ${u.username}...`);
          await supabase.from('profiles').insert({
            id: userId,
            username: u.username,
            fullName: u.fullName,
            role: u.role,
            department: u.department,
            nisn: u.nisn || ''
          });
        }
      }

      console.log(`Checked/Created account for ${u.username}`);
    } catch (err: any) {
      console.error(`Error for ${u.username}:`, err.message);
    }
  }
}

export async function seedExams() {
  const depts = ["TKJ", "DKV", "AK", "BC", "MPLB", "BD"];
  for (const dept of depts) {
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .insert({
        title: `Ujian Kejuruan ${dept}`,
        department: dept,
        kkm: 70,
      })
      .select()
      .single();

    if (examError) {
      console.error(examError);
      continue;
    }

    // Add 30 mock questions for each
    const questions = [];
    for (let i = 1; i <= 30; i++) {
      questions.push({
        examId: examData.id,
        text: `Pertanyaan ${i} untuk jurusan ${dept}: Materi Kompetensi Dasar ${i}?`,
        options: ["Pilihan A (Benar)", "Pilihan B", "Pilihan C", "Pilihan D"],
        correctOption: 0,
        difficulty: i > 20 ? "sulit" : "gampang"
      });
    }

    const { error: qError } = await supabase
      .from('questions')
      .insert(questions);
    
    if (qError) console.error(qError);
  }
}
