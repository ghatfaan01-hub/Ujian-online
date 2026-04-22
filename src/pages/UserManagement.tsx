import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Search, MoreVertical, Trash2, Edit2, ShieldCheck, Mail, User } from 'lucide-react';
import { cn } from '../lib/utils';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'));
      const snap = await getDocs(q);
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nisn?.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manajemen Pengguna</h2>
          <p className="text-gray-500">Kelola Guru, Tenaga Kependidikan, dan Siswa.</p>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-colors shadow-lg shadow-red-100">
          <UserPlus size={20} />
          Tambah User Baru
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau username..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary rounded-xl transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-4">User</th>
                <th className="px-8 py-4">Role</th>
                <th className="px-8 py-4">Jurusan</th>
                <th className="px-8 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-50 text-primary rounded-xl flex items-center justify-center font-bold">
                        {u.fullName?.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{u.fullName}</span>
                        <span className="text-xs text-gray-400">{u.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      u.role === 'admin' ? "bg-red-100 text-red-600" :
                      u.role === 'guru' ? "bg-blue-100 text-blue-600" :
                      u.role === 'siswa' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-500 italic">
                    {u.department || '-'}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-blue-600 bg-white rounded-lg border border-gray-100 shadow-sm transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-primary bg-white rounded-lg border border-gray-100 shadow-sm transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
