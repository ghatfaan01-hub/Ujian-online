import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Award, 
  Calendar, 
  Clock, 
  ChevronRight,
  ClipboardList,
  AlertCircle,
  Database,
  Loader2,
  UserPlus
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { seedExams, createTestAccounts } from '../services/seedService';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { profile, isAdmin, isGuru, isSiswa } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [creatingAccounts, setCreatingAccounts] = useState(false);
  
  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedExams();
      alert('Sistem berhasil di-bootstrap dengan data ujian & pertanyaan!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Gagal melakukan bootstrap.');
    } finally {
      setSeeding(false);
    }
  };

  const handleCreateAccounts = async () => {
    setCreatingAccounts(true);
    try {
      await createTestAccounts();
      alert('Akun demo berhasil dibuat! \n\nSiswa: siswa_tkj / password123 \nGuru: guru_tkj / password123 \n\nSilakan mencoba login.');
    } catch (err) {
      console.error(err);
      alert('Gagal membuat akun demo. Mungkin sudah ada.');
    } finally {
      setCreatingAccounts(false);
    }
  };

  const welcomeMessage = () => {
    if (isAdmin) return 'Dashboard Administrator';
    if (isGuru) return 'Dashboard Guru Pengampu';
    if (isSiswa) return 'Halaman Siswa';
    return 'Dashboard Dashboard';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-red-100"
      >
        <div className="relative z-10 w-full md:w-2/3">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            {welcomeMessage()}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Selamat datang kembali, <br /> {profile?.fullName}!
          </h1>
          <p className="text-white/80 text-lg max-w-lg mb-6">
            Siap untuk melanjutkan aktivitas belajar mengajar di SMK Prima Unggul hari ini? Tetap semangat dan berikan yang terbaik!
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <Award size={400} />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label={isAdmin ? "Total User" : "Teman Sejawat"} 
          value={isAdmin ? "124" : "Jurusan " + profile?.department} 
          color="blue" 
        />
        <StatCard 
          icon={ClipboardList} 
          label="Kehadiran" 
          value="98%" 
          color="green" 
        />
        <StatCard 
          icon={Award} 
          label={isSiswa ? "Nilai Rata-rata" : "Ujian Aktif"} 
          value={isSiswa ? "85.4" : "12"} 
          color="orange" 
        />
        <StatCard 
          icon={Calendar} 
          label="Hari Efektif" 
          value="Semester Genap" 
          color="purple" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900">Aktivitas Terkini</h3>
            {isAdmin && (
              <div className="flex gap-2">
                <button 
                  onClick={handleCreateAccounts}
                  disabled={creatingAccounts}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {creatingAccounts ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
                  Buat Akun Demo (GURU/SISWA)
                </button>
                <button 
                  onClick={handleSeed}
                  disabled={seeding}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all disabled:opacity-50"
                >
                  {seeding ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />}
                  Bootstrap Ujian & Soal (30 Soal/Jurusan)
                </button>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <ActivityItem 
              type="attendance" 
              title="Absensi Terdaftar" 
              desc="Anda telah melakukan absensi hari ini pukul 07:15 WIB" 
              time="2 jam yang lalu" 
            />
            <ActivityItem 
              type="exam" 
              title="Ujian Matematika" 
              desc="Telah menyelesaikan ujian Matematika dengan nilai 88" 
              time="Kemarin" 
            />
            <ActivityItem 
              type="info" 
              title="Pengumuman" 
              desc="Jadwal ujian tengah semester telah diperbarui" 
              time="3 hari yang lalu" 
            />
          </div>
        </div>

        {/* Calendar / Info Sidebar */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Agenda Sekolah</h3>
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-50 text-primary rounded-2xl flex items-center justify-center font-bold">
                24
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900">Ujian Kompetensi</span>
                <span className="text-xs text-gray-500">Selasa, 14:00 • Lab Komputer</span>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-6 opacity-50">
              <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center font-bold">
                26
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900">Rapat Guru</span>
                <span className="text-xs text-gray-500">Kamis, 15:30 • Ruang Guru</span>
              </div>
            </div>
            <button className="w-full py-4 bg-gray-50 text-gray-900 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-colors">
              Lihat Kalender Lengkap
            </button>
          </div>

          <div className="bg-orange-50 rounded-[2rem] p-6 border border-orange-100 flex items-start gap-4">
            <AlertCircle className="text-orange-600 mt-1" size={24} />
            <div>
              <p className="font-bold text-orange-900 mb-1">Peringatan KKM</p>
              <p className="text-xs text-orange-700 leading-relaxed">Nilai minimal kelulusan (KKM) untuk semua jurusan adalah 50. Tetap fokus!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className={cn("p-6 rounded-[2rem] border shadow-sm", colors[color])}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white rounded-xl shadow-sm">
          <Icon size={20} />
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">{label}</p>
        <p className="text-2xl font-extrabold">{value}</p>
      </div>
    </div>
  );
}

function ActivityItem({ type, title, desc, time }: any) {
  const icons: any = {
    attendance: <Clock className="text-green-600" />,
    exam: <Award className="text-blue-600" />,
    info: <AlertCircle className="text-orange-600" />
  };

  const bgs: any = {
    attendance: "bg-green-50",
    exam: "bg-blue-50",
    info: "bg-orange-50"
  };

  return (
    <div className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-gray-50 shadow-sm hover:shadow-md transition-all group">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", bgs[type])}>
        {icons[type]}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-bold text-gray-900">{title}</h4>
          <span className="text-[10px] font-bold text-gray-400 uppercase">{time}</span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
