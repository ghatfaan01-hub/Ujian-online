import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MapPin, Clock, CheckCircle, AlertTriangle, UserCheck, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Attendance() {
  const { profile, user, isGuru, isStaff } = useAuth();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const navigate = useNavigate();
  
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('userId', user.id)
        .order('timestamp', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClockIn = async (status: string) => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('attendance')
        .insert({
          userId: user.id,
          targetId: user.id,
          type: 'karyawan',
          status,
          date: today,
          location: 'Tangerang Selatan',
          fullName: profile.fullName
        });

      if (error) throw error;
      fetchHistory();
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim absensi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Presensi Kehadiran</h2>
          <p className="text-gray-500">Silakan lakukan absensi harian anda di sini.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Waktu Sekarang</p>
          <p className="text-2xl font-black text-primary">
            {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Main Action Card */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-red-50 text-primary rounded-2xl">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lokasi Anda</p>
                  <p className="font-bold text-gray-900">Tangerang Selatan, Banten</p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-6">Sudahkah Anda Siap?</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <AttendanceButton 
                  onClick={() => handleClockIn('hadir')} 
                  icon={CheckCircle} 
                  label="Hadir" 
                  color="primary" 
                  loading={loading}
                />
                <AttendanceButton 
                  onClick={() => handleClockIn('sakit')} 
                  icon={AlertTriangle} 
                  label="Sakit" 
                  color="orange" 
                  loading={loading}
                />
                <AttendanceButton 
                  onClick={() => handleClockIn('izin')} 
                  icon={Clock} 
                  label="Izin" 
                  color="blue" 
                  loading={loading}
                />
                <AttendanceButton 
                  onClick={() => handleClockIn('alfa')} 
                  icon={AlertTriangle} 
                  label="Alfa" 
                  color="gray" 
                  loading={loading}
                />
              </div>
            </div>
            
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Users size={180} />
            </div>
          </div>

          {/* History */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 px-2">Riwayat Minggu Ini</h3>
            {history.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-[2rem] border border-gray-50 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-bold uppercase",
                    item.status === 'hadir' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                  )}>
                    {item.status.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 capitalize">{item.status}</p>
                    <p className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white">
            <h4 className="text-xl font-bold mb-4">Informasi Kehadiran</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold">1</span>
                </div>
                <p className="text-sm text-white/70">Wajib melakukan absensi paling lambat pukul 07:15 WIB.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold">2</span>
                </div>
                <p className="text-sm text-white/70">Lokasi absensi terdeteksi otomatis melalui modul GPS sistem.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold">3</span>
                </div>
                <p className="text-sm text-white/70">Kesalahan input dapat dilaporkan ke bagian Tata Usaha.</p>
              </li>
            </ul>
          </div>

          {isGuru && (
            <button 
              onClick={() => navigate('/app/attendance?type=siswa')}
              className="w-full p-8 bg-red-50 text-primary rounded-[2.5rem] border border-red-100 flex flex-col items-center gap-4 group hover:bg-primary hover:text-white transition-all shadow-lg shadow-red-50"
            >
              <UserCheck size={32} className="group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <p className="font-extrabold text-lg">Absen Siswa</p>
                <p className="text-xs font-medium opacity-70">Lakukan absensi untuk siswa di dalam kelas.</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AttendanceButton({ onClick, icon: Icon, label, color, loading }: any) {
  const bgs: any = {
    primary: "bg-primary hover:bg-primary-dark text-white shadow-red-100 shadow-xl",
    orange: "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-100 shadow-xl",
    blue: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 shadow-xl",
    gray: "bg-gray-600 hover:bg-gray-700 text-white shadow-gray-100 shadow-xl",
  };

  return (
    <button
      disabled={loading}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center py-6 px-4 rounded-3xl transition-all font-bold gap-2",
        bgs[color]
      )}
    >
      <Icon size={24} />
      <span>{label}</span>
    </button>
  );
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(' ');
}
