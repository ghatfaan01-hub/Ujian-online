import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GraduationCap, Lock, User, AlertCircle, BookOpen, Fingerprint, Database, Loader2, MapPin, Clock as ClockIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { seedExams, createTestAccounts } from '../services/seedService';

export default function LoginPage() {
  const [role, setRole] = useState<'siswa' | 'guru'>('siswa');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nisn, setNisn] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(currentTime);

  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const handleBootstrap = async () => {
    if (!supabase) return;
    setBootstrapping(true);
    try {
      await createTestAccounts();
      await seedExams();
      alert('Sistem berhasil disiapkan!\n\nGunakan:\n- Admin: admin / password123\n- Siswa: siswa_tkj / password123 (NISN: 1122334455 / TKJ)');
    } catch (err: any) {
      alert('Peringatan: ' + err.message);
    } finally {
      setBootstrapping(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!supabase) {
      setError('Konfigurasi Supabase belum disiapkan. Silakan atur VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Secrets.');
      return;
    }

    setLoading(true);

    try {
      const email = username.includes('@') ? username : `${username}@smkprima.sch.id`;
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user?.id)
        .single();
      
      if (profileError || !profile) {
        throw new Error('Profil pengguna tidak ditemukan di database.');
      }

      if (role === 'siswa') {
        if (profile.role !== 'siswa' && profile.role !== 'admin') {
          throw new Error('Akun ini bukan akun siswa.');
        }
        if (profile.nisn !== nisn && profile.role !== 'admin') {
          throw new Error('NISN yang anda masukkan tidak sesuai.');
        }
        if (profile.department !== jurusan && profile.role !== 'admin') {
          throw new Error('Jurusan yang anda masukkan tidak sesuai.');
        }
      } else {
        if (profile.role === 'siswa') {
          throw new Error('Akun ini bukan akun guru/staff.');
        }
      }

      navigate('/app');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal masuk. Periksa kembali data anda.');
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-4 perspective-1000">
      {/* Background 3D Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, rotateX: 20, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="w-full max-w-lg bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(200,0,0,0.15)] p-1 md:p-2 relative z-10 border border-white"
      >
        <div className="bg-white rounded-[2.8rem] p-8 md:p-12 border border-gray-100/50 shadow-inner">
          {/* Top Info Bar */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-10 border-b border-gray-50 pb-6 px-2">
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin size={16} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Kota Tangerang Selatan</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl">
              <ClockIcon size={14} className="text-primary" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-gray-900 leading-none">{formattedTime}</span>
                <span className="text-[8px] font-bold text-gray-400 leading-none mt-1">{formattedDate}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              whileHover={{ rotateY: 180 }}
              transition={{ duration: 0.6 }}
              className="w-24 h-24 bg-primary text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-red-200 preserve-3d"
            >
              <GraduationCap size={48} />
            </motion.div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight text-center leading-none">SMK PRIMA UNGGUL</h1>
            <p className="text-xs font-bold text-primary uppercase tracking-[0.3em] mt-3 bg-red-50 px-4 py-1.5 rounded-full">Official Portal</p>
          </div>

          <div className="flex p-1.5 bg-gray-100/80 rounded-[1.5rem] mb-10 backdrop-blur-sm">
            <button 
              type="button"
              onClick={() => { setRole('siswa'); setError(''); }}
              className={cn(
                "flex-1 py-4 rounded-[1.2rem] text-sm font-black transition-all transform",
                role === 'siswa' ? "bg-white text-primary shadow-xl scale-100" : "text-gray-500 hover:text-gray-700 scale-95 opacity-60"
              )}
            >
              Portal Siswa
            </button>
            <button 
              type="button"
              onClick={() => { setRole('guru'); setError(''); }}
              className={cn(
                "flex-1 py-4 rounded-[1.2rem] text-sm font-black transition-all transform",
                role === 'guru' ? "bg-white text-primary shadow-xl scale-100" : "text-gray-500 hover:text-gray-700 scale-95 opacity-60"
              )}
            >
              Guru & Staff
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className={cn(
                  "mb-8 p-6 rounded-3xl flex flex-col gap-3 border shadow-2xl",
                  error.includes('Konfigurasi') 
                    ? "bg-orange-50 border-orange-200 text-orange-900 shadow-orange-100" 
                    : "bg-red-50 border-red-200 text-red-900 shadow-red-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className={error.includes('Konfigurasi') ? "text-orange-600" : "text-red-600"} size={22} />
                  <span className="text-xs font-black uppercase tracking-wider">
                    {error.includes('Konfigurasi') ? 'KONFIGURASI DIPERLUKAN' : 'AKSES DITOLAK'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed font-bold opacity-80">{error}</p>
                
                {error.includes('Konfigurasi') && (
                  <div className="mt-2 p-4 bg-white/80 rounded-2xl border border-orange-200/50">
                    <p className="text-[10px] font-black text-orange-800 uppercase mb-3">PANDUAN ADMIN SISTEM:</p>
                    <ol className="text-[10px] list-decimal list-inside space-y-2 text-orange-700 font-black">
                      <li>Buka Dashboard Supabase &rarr; API Settings</li>
                      <li>Copy <span className="bg-orange-100 px-1">Project URL</span> & <span className="bg-orange-100 px-1">Anon Key</span></li>
                      <li>Buka <span className="bg-orange-100 px-1">Settings &rarr; Secrets</span> di AI Studio</li>
                      <li>Masukkan <span className="text-orange-900">VITE_SUPABASE_URL</span></li>
                      <li>Masukkan <span className="text-orange-900">VITE_SUPABASE_ANON_KEY</span></li>
                    </ol>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Autentikasi User</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:ring-0 focus:border-primary/20 rounded-[1.8rem] transition-all font-bold placeholder:text-gray-300 shadow-sm"
                  placeholder="Username / ID User"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Kata Sandi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:ring-0 focus:border-primary/20 rounded-[1.8rem] transition-all font-bold placeholder:text-gray-300 shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {role === 'siswa' && (
                <motion.div
                  key="siswa-fields"
                  initial={{ opacity: 0, height: 0, y: 20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 20 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Nomor Induk (NISN)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                        <Fingerprint size={20} />
                      </div>
                      <input
                        type="text"
                        value={nisn}
                        onChange={(e) => setNisn(e.target.value)}
                        className="block w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:ring-0 focus:border-primary/20 rounded-[1.8rem] transition-all font-bold placeholder:text-gray-300"
                        placeholder="10 Digit NISN"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Program Studi</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                        <BookOpen size={20} />
                      </div>
                      <select
                        value={jurusan}
                        onChange={(e) => setJurusan(e.target.value)}
                        className="block w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:ring-0 focus:border-primary/20 rounded-[1.8rem] appearance-none transition-all font-bold shadow-sm cursor-pointer"
                        required
                      >
                        <option value="">Pilih Jurusan Anda</option>
                        <option value="TKJ">Teknik Komputer Jaringan</option>
                        <option value="DKV">Desain Komunikasi Visual</option>
                        <option value="AK">Akuntansi Keuangan</option>
                        <option value="BC">Broadcasting & TV</option>
                        <option value="MPLB">Manajemen Perkantoran</option>
                        <option value="BD">Bisnis Digital</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02, translateY: -5 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-lg hover:bg-primary-dark transition-all shadow-2xl shadow-red-200 flex items-center justify-center gap-4 disabled:opacity-50 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {loading ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full"
                  />
                  <span>PROSES VERIFIKASI...</span>
                </>
              ) : (
                <>
                  <Fingerprint size={24} />
                  <span>MASUK SEKARANG</span>
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-12 pt-10 border-t border-gray-100 flex flex-col items-center gap-4 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Administrator Portal</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              onClick={handleBootstrap}
              disabled={bootstrapping}
              className="flex items-center gap-3 px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
            >
              {bootstrapping ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : <Database size={14} />}
              SIAPKAN INSTALASI DATA AWAL
            </motion.button>
            <p className="text-[9px] font-bold text-gray-300 italic max-w-[200px]">Hak Cipta © 2024 SMK Prima Unggul. Dikembangkan untuk Keunggulan Akademik.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
