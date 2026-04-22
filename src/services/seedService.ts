import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  query,
  where,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../lib/firebase';

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
      const res = await createUserWithEmailAndPassword(auth, email, u.password);
      await setDoc(doc(db, 'users', res.user.uid), {
        uid: res.user.uid,
        username: u.username,
        role: u.role,
        fullName: u.fullName,
        department: u.department,
        nisn: u.nisn || '',
        createdAt: serverTimestamp()
      });
      console.log(`Created account for ${u.username}`);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        console.log(`Account ${u.username} already exists.`);
      } else {
        console.error(err);
      }
    }
  }
}

export const departmentQuestions: Record<string, any[]> = {
  "TKJ": [
    { text: "Apa kepanjangan dari OSI?", options: ["Open System Interconnection", "Open Source Internet", "Optical System Interface", "Original System Input"], correctOption: 0, difficulty: "gampang" },
    { text: "Protokol yang digunakan untuk mengirim email adalah?", options: ["HTTP", "FTP", "SMTP", "POP3"], correctOption: 2, difficulty: "gampang" },
    { text: "Berapa jumlah host pada subnet mask /24?", options: ["254", "510", "126", "62"], correctOption: 0, difficulty: "sulit" },
    // ... more would be added
  ],
  "DKV": [
    { text: "Warna sekunder adalah hasil campuran dari?", options: ["Warna Primer", "Warna Tersier", "Warna Netral", "Hitam dan Putih"], correctOption: 0, difficulty: "gampang" },
    { text: "Software pengolah gambar berbasis vektor adalah?", options: ["Adobe Photoshop", "Adobe Illustrator", "CorelDraw", "B dan C Benar"], correctOption: 3, difficulty: "gampang" },
    // ...
  ]
};

// I'll create a function to generate 30 questions using Gemini later if needed, 
// but for a robust app, I'll provide a set of baseline questions.

export async function seedExams() {
  const depts = ["TKJ", "DKV", "AK", "BC", "MPLB", "BD"];
  for (const dept of depts) {
    const examRef = await addDoc(collection(db, 'exams'), {
      title: `Ujian Kejuruan ${dept}`,
      department: dept,
      kkm: 50,
      createdAt: new Date(),
    });

    // Add 30 mock questions for each
    for (let i = 1; i <= 30; i++) {
      await addDoc(collection(db, 'exams', examRef.id, 'questions'), {
        text: `Pertanyaan ${i} untuk jurusan ${dept}: Apa yang dimaksud dengan Kompetensi Dasar ${i}?`,
        options: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
        correctOption: Math.floor(Math.random() * 4),
        difficulty: i > 20 ? "sulit" : "gampang"
      });
    }
  }
}
