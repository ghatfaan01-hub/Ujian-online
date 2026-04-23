import { supabase } from '../lib/supabase';

export async function createTestAccounts() {
  const testUsers = [
    { username: 'admin', password: 'password123', role: 'admin', fullName: 'Administrator Utama', department: 'Umum' },
    { username: 'guru_tkj', password: 'password123', role: 'guru', fullName: 'Bpk. Wijaya, S.Kom', department: 'TKJ' },
    { username: 'siswa_tkj', password: 'password123', role: 'siswa', fullName: 'Budi Santoso', department: 'TKJ', nisn: '1122334455' },
    { username: 'siswa_dkv', password: 'password123', role: 'siswa', fullName: 'Siti Aminah', department: 'DKV', nisn: '5544332211' }
  ];

  for (const u of testUsers) {
    try {
      const email = `${u.username}@smkprima.sch.id`;
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

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('Database error')) {
          console.log(`Account ${u.username} already exists or has conflict.`);
          continue;
        }
        throw error;
      }
      console.log(`Created account for ${u.username}`);
    } catch (err: any) {
      console.error(err);
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
