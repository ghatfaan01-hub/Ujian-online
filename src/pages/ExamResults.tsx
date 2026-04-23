import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Award, User, BookOpen, AlertCircle, Search, ChevronRight, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function ExamResults() {
  const { isGuru, isAdmin, profile } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResults();
  }, [profile]);

  const fetchResults = async () => {
    try {
      let query = supabase.from('exam_results').select('*');
      
      // If student, only show their own
      if (profile?.role === 'siswa') {
        query = query.eq('studentId', profile.id);
      } 
      // If guru, show results for their department
      else if (isGuru && !isAdmin) {
        query = query.eq('department', profile?.department);
      }

      const { data, error } = await query.order('submittedAt', { ascending: false });
      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(r => 
    r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.examTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.nisn?.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Hasil Nilai Ujian</h2>
          <p className="text-gray-500 font-medium">Rekapitulasi nilai pengerjaan soal ujian online {profile?.role === 'siswa' ? 'anda' : 'siswa'}.</p>
        </div>
        
        <div className="relative w-full md:w-72 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Cari Siswa / Ujian..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400">
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest border-b border-gray-100">Siswa</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest border-b border-gray-100">Mata Pelajaran</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest border-b border-gray-100 text-center">Nilai</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest border-b border-gray-100">Status</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest border-b border-gray-100">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Sinkronisasi Data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Award size={32} />
                    </div>
                    <p className="text-gray-500 font-bold italic">Belum ada data nilai tersedia.</p>
                  </td>
                </tr>
              ) : (
                filteredResults.map((result) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={result.id} 
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                          <User size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 leading-tight">{result.studentName}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">NISN: {result.nisn}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700 leading-tight">{result.examTitle}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{result.department}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={cn(
                        "text-2xl font-black",
                        result.score >= 70 ? "text-green-600" : "text-red-600"
                      )}>
                        {result.score}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        result.status === 'lulus' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      )}>
                        {result.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={14} />
                        <span className="text-xs font-bold">{new Date(result.submittedAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
