import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { GraduationCap, UserPlus, Search, Trash2, Edit2, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

export default function StudentManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const q = query(collection(db, 'students'));
      const snap = await getDocs(q);
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nisn?.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Data Siswa</h2>
          <p className="text-gray-500">Master data seluruh siswa SMK Prima Unggul.</p>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-colors shadow-lg shadow-red-100">
          <UserPlus size={20} />
          Tambah Siswa
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari NISN atau Nama Siswa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary rounded-2xl transition-all"
            />
          </div>
          <div className="flex gap-2">
             <button className="p-4 bg-gray-50 text-gray-500 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                <Filter size={20} />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-4">Siswa</th>
                <th className="px-8 py-4">NISN</th>
                <th className="px-8 py-4">Kelas</th>
                <th className="px-8 py-4">Jurusan</th>
                <th className="px-8 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-50 text-primary rounded-2xl flex items-center justify-center font-bold">
                        {s.name?.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-mono text-xs font-bold text-gray-400">
                    {s.nisn}
                  </td>
                  <td className="px-8 py-5 font-bold text-gray-900">
                    {s.class}
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-gray-100 text-[10px] font-black text-gray-500 uppercase rounded-md tracking-wider">
                      {s.department}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 text-gray-400 hover:text-blue-600 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2.5 text-gray-400 hover:text-primary bg-white rounded-xl border border-gray-100 shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium whitespace-nowrap">
                    Data siswa tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
