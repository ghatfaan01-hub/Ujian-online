import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  query,
  where,
  addDoc
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../lib/firebase';

export async function bootstrapSystem() {
  // 1. Create Admin if not exists
  // For demo, we might need to handle this via UI because we can't create users easily without auth session
  // But we can check if the current user is first user.
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
