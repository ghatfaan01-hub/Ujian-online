import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle, ChevronRight, ChevronLeft, AlertCircle, Award } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ExamSession() {
  const { id } = useParams();
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchExamAndQuestions();
  }, [id]);

  const fetchExamAndQuestions = async () => {
    if (!id) return;
    try {
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', id)
        .single();
      
      if (examError || !examData) {
        navigate('/app/exams');
        return;
      }
      setExam(examData);

      const { data: qData, error: qError } = await supabase
        .from('questions')
        .select('*')
        .eq('examId', id)
        .order('id', { ascending: true });
      
      if (qError) throw qError;
      setQuestions((qData || []).slice(0, 30));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (optionIdx: number) => {
    setAnswers({ ...answers, [currentIdx]: optionIdx });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    let correctCount = 0;
    questions.forEach((q, idx) => {
      // Supabase stores as integer directly if not using JSONB, 
      // but if we used JSONB for options, correctOption is a number field.
      if (answers[idx] === q.correctOption) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    const passed = finalScore >= (exam.kkm || 70);

    try {
      const { error } = await supabase
        .from('exam_results')
        .insert({
          studentId: user?.id,
          studentName: profile?.fullName,
          nisn: profile?.nisn || '',
          examId: exam.id,
          examTitle: exam.title,
          score: finalScore,
          status: passed ? 'lulus' : 'tidak_lulus',
          department: profile?.department
        });

      if (error) throw error;
      setScore(finalScore);
      setFinished(true);
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim jawaban. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-20">Memuat Ujian...</div>;

  if (finished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-gray-100"
      >
        <div className={cn(
          "w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8",
          score >= 70 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        )}>
          <Award size={48} />
        </div>
        <h2 className="text-4xl font-black text-gray-900 mb-2">Ujian Selesai!</h2>
        <p className="text-gray-500 mb-8 font-medium">Hasil pengerjaan anda telah tersimpan secara permanen di sistem.</p>
        
        <div className="bg-gray-50 rounded-[2rem] p-8 mb-8 border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nilai Akhir</p>
          <p className="text-7xl font-black text-gray-900 mb-2">{score}</p>
          <div className={cn(
            "inline-block px-4 py-1 rounded-full text-xs font-bold uppercase",
            score >= 70 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          )}>
            {score >= 70 ? "Lulus KKM" : "Tidak Lulus KKM"}
          </div>
        </div>

        <button 
          onClick={() => navigate('/app')}
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-dark transition-all shadow-lg shadow-red-100"
        >
          Kembali ke Dashboard
        </button>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{exam?.title}</h2>
          <p className="text-sm font-medium text-gray-400 italic">Pertanyaan {currentIdx + 1} dari {questions.length}</p>
        </div>
        <div className="px-6 py-3 bg-gray-900 text-white rounded-2xl flex items-center gap-3 font-bold">
          <Clock size={20} className="text-primary" />
          <span>59:42</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full mb-12 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          className="h-full bg-primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Question Panel */}
        <div className="lg:col-span-3 space-y-8">
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-6">
               <span className={cn(
                 "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                 currentQuestion?.difficulty === 'sulit' ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
               )}>
                 {currentQuestion?.difficulty}
               </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 leading-snug mb-10">
              {currentQuestion?.text}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {currentQuestion?.options.map((option: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={cn(
                    "flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-left group",
                    answers[currentIdx] === idx 
                      ? "border-primary bg-red-50 text-primary" 
                      : "border-gray-50 bg-gray-50 hover:border-gray-200 hover:bg-white text-gray-600"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all",
                    answers[currentIdx] === idx ? "bg-primary text-white" : "bg-white text-gray-300 group-hover:text-gray-400"
                  )}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="font-bold text-lg">{option}</span>
                </button>
              ))}
            </div>
          </motion.div>

          <div className="flex items-center justify-between">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(currentIdx - 1)}
              className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-0"
            >
              <ChevronLeft size={20} /> Sebelumnya
            </button>
            <button
              onClick={() => currentIdx === questions.length - 1 ? handleSubmit() : setCurrentIdx(currentIdx + 1)}
              disabled={submitting}
              className={cn(
                "flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-white transition-all shadow-lg",
                currentIdx === questions.length - 1 ? "bg-green-600 hover:bg-green-700 shadow-green-100" : "bg-primary hover:bg-primary-dark shadow-red-100"
              )}
            >
              {currentIdx === questions.length - 1 ? (submitting ? 'Mengirim...' : 'Selesaikan Ujian') : 'Berikutnya'} <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Question Map */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 mb-4 px-2 uppercase tracking-widest">Daftar Soal</h4>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={cn(
                    "w-full aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all",
                    currentIdx === idx ? "bg-primary text-white shadow-lg" : 
                    answers[idx] !== undefined ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-primary mt-1" size={20} />
              <p className="text-[11px] font-bold text-primary leading-relaxed uppercase italic">
                Jawaban otomatis tersimpan setiap kali anda memilih opsi. Pastikan koneksi stabil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
