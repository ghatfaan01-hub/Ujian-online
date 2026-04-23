import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, Clock, Award, ShieldAlert, ChevronRight, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function ExamList() {
  const { profile, isGuru } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, [profile]);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .in('department', [profile?.department, 'Umum'])
        .order('title', { ascending: true });
      
      if (error) throw error;
      setExams(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">E-Learning & Ujian</h2>
          <p className="text-gray-500">Pilih mata pelajaran atau ujian kompetensi yang aktif hari ini.</p>
        </div>
        {isGuru && (
          <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-colors shadow-lg shadow-red-100">
            <BookOpen size={20} />
            Buat Ujian Baru
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2rem] border border-gray-100">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Memuat daftar tugas & ujian...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2rem] border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada ujian aktif</h3>
              <p className="text-gray-500 max-w-sm">Guru belum menjadwalkan ujian untuk jurusan {profile?.department} hari ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {exams.map((exam) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row items-center gap-6"
                >
                  <div className="w-16 h-16 bg-red-50 text-primary rounded-2xl flex items-center justify-center shrink-0">
                    <BookOpen size={28} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                      <h4 className="text-xl font-bold text-gray-900">{exam.title}</h4>
                      <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 uppercase rounded-md tracking-wider">
                        {exam.department}
                      </span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-semibold text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={14} /> 60 Menit</span>
                      <span className="flex items-center gap-1"><Award size={14} /> KKM: {exam.kkm || 70}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/app/exams/${exam.id}`)}
                    className="px-6 py-4 bg-primary text-white rounded-2xl font-extrabold flex items-center gap-2 hover:bg-primary-dark transition-all transform group-hover:scale-105"
                  >
                    Mulai Ujian <PlayCircle size={20} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldAlert className="text-red-500" /> Aturan Ujian Online
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-white">!</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">Dilarang membuka tab lain atau meminimalkan browser saat ujian berlangsung.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-white">!</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">Ujian memiliki batas waktu otomatis. Hasil akan tersimpan saat waktu habis.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-white">!</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">Nilai minimal kelulusan (KKM) adalah 70 poin.</p>
                </li>
              </ul>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[80px] opacity-20"></div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
              <Award size={32} />
            </div>
            <h5 className="text-lg font-bold text-gray-900 mb-2">Nilai Terakhir</h5>
            <p className="text-4xl font-black text-gray-900 mb-1">88</p>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-6 italic">Lulus KKM</p>
            <button className="w-full py-4 border border-gray-100 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-colors">
              Detail Hasil Ujian
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
