import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { History, Filter, Download, UserCheck, Search, Award } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AttendanceRecords() {
  const { isStaff, isGuru, profile } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'attendance') {
        const q = query(collection(db, 'attendance'), orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        setRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        const q = query(
          collection(db, 'examResults'), 
          where('department', '==', profile?.department),
          orderBy('submittedAt', 'desc')
        );
        const snap = await getDocs(q);
        setExamResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
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
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Rekapitulasi Data</h2>
          <p className="text-gray-500">Monitoring hasil ujian dan kehadiran secara real-time.</p>
        </div>
        <button className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-colors">
          <Download size={20} />
          Ekspor Laporan
        </button>
      </div>

      <div className="flex gap-4 p-2 bg-white rounded-2xl border border-gray-100 shadow-sm w-fit">
        <button 
          onClick={() => setActiveTab('attendance')}
          className={cn(
            "px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
            activeTab === 'attendance' ? "bg-primary text-white shadow-lg shadow-red-100" : "text-gray-400 hover:text-gray-900"
          )}
        >
          <UserCheck size={18} /> Absensi
        </button>
        <button 
          onClick={() => setActiveTab('exams')}
          className={cn(
            "px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
            activeTab === 'exams' ? "bg-primary text-white shadow-lg shadow-red-100" : "text-gray-400 hover:text-gray-900"
          )}
        >
          <Award size={18} /> Nilai Ujian
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'attendance' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-4">Personal</th>
                  <th className="px-8 py-4">Tipe</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="px-8 py-5">
                      <p className="font-bold text-gray-900">{r.fullName}</p>
                      <p className="text-xs text-gray-400 italic">User ID: {r.userId?.slice(0, 8)}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-md">
                        {r.type}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                         <div className={cn(
                           "w-2 h-2 rounded-full",
                           r.status === 'hadir' ? "bg-green-500" : "bg-orange-500"
                         )} />
                         <span className="font-bold text-gray-900 capitalize">{r.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-500">
                      {new Date(r.date).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-4">Siswa</th>
                  <th className="px-8 py-4">Mata Pelajaran</th>
                  <th className="px-8 py-4">Nilai</th>
                  <th className="px-8 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {examResults.map((e) => (
                  <tr key={e.id}>
                    <td className="px-8 py-5">
                      <p className="font-bold text-gray-900">{e.studentName}</p>
                      <p className="text-xs text-gray-400">NISN: {e.nisn}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-bold text-gray-900">{e.examTitle}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xl font-black text-gray-900">{e.score}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                        e.score >= 50 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      )}>
                        {e.score >= 50 ? "Lulus" : "Tidak Lulus"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
