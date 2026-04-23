import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GraduationCap, Lock, User, AlertCircle, BookOpen, Fingerprint, Database, Loader2, MapPin, Clock as ClockIcon, UserPlus, LogIn, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { seedExams, createTestAccounts } from '../services/seedService';

export default function LoginPage() {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'siswa' | 'guru' | 'staff' | 'admin'>('siswa');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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
      alert('Sistem berhasil diinisialisasi!\n\nID Akses Utama:\n- Admin: admin@smkpu.id / password123\n- Siswa: siswa@smkpu.id / pu123');
    } catch (err: any) {
      alert('Informasi: ' + err.message);
    } finally {
      setBootstrapping(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!supabase) {
      setError('Sistem belum terhubung ke database. Mohon hubungi administrator.');
      return;
    }

    setLoading(true);

    try {
      const email = username.includes('@') ? username : `${username}@smkpu.id`;
      
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
        throw new Error('Identitas anda belum terdaftar di sistem profil.');
      }

      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Periksa kembali ID dan Kata Sandi anda.');
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!supabase) return;
    setLoading(true);

    try {
      const email = `${username.toLowerCase()}@smkpu.id`;
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.toLowerCase(),
            fullName,
            role: 'siswa',
            department: jurusan,
            nisn: nisn
          }
        }
      });

      if (signUpError) throw signUpError;
      
      if (data.user) {
        alert('Pendaftaran Berhasil! Silakan masuk menggunakan akun baru anda.');
        setView('login');
        setUsername(username);
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4 perspective-1000">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ y: [0, -40, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ y: [0, 40, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        className="w-full max-w-xl bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] p-1.5 z-10 relative overflow-hidden"
      >
        <div className="bg-white rounded-[3.3rem] p-8 md:p-14 border border-gray-100">
          {/* Official Branding */}
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-red-100"
            >
              <GraduationCap size={44} />
            </motion.div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight text-center">PUSAT LAYANAN AKADEMIK</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-12 h-[2px] bg-primary/20"></span>
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">SMK Prima Unggul Official</p>
              <span className="w-12 h-[2px] bg-primary/20"></span>
            </div>
          </div>

          {/* Time & Location */}
          <div className="flex justify-between items-center mb-10 bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
             <div className="flex items-center gap-2">
                <MapPin size={14} className="text-primary" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tangerang Selatan</span>
             </div>
             <div className="flex items-center gap-3">
                <ClockIcon size={14} className="text-gray-400" />
                <span className="text-[11px] font-black text-gray-800">{formattedTime} • <span className="text-gray-400 font-bold">{formattedDate}</span></span>
             </div>
          </div>

          {/* View Switcher */}
          <div className="flex p-1.5 bg-gray-100 rounded-3xl mb-10">
            <button 
              onClick={() => { setView('login'); setError(''); }}
              className={cn(
                "flex-1 py-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2",
                view === 'login' ? "bg-white text-primary shadow-lg" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <LogIn size={16} /> MASUK PORTAL
            </button>
            <button 
              onClick={() => { setView('register'); setError(''); }}
              className={cn(
                "flex-1 py-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2",
                view === 'register' ? "bg-white text-primary shadow-lg" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <UserPlus size={16} /> DAFTAR BARU
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-900 flex items-start gap-4"
              >
                <AlertCircle className="shrink-0 text-red-600" size={24} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider mb-1">Terjadi Kendala Keamanan</span>
                  <p className="text-[11px] font-bold opacity-80">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {view === 'register' && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Nama Lengkap Sesuai Ijazah</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-3xl transition-all font-bold placeholder:text-gray-300 text-sm"
                      placeholder="Contoh: Ahmad Subono"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{view === 'login' ? 'ID PORTAL / USERNAME' : 'IDENTITAS USER (USERNAME)'}</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-3xl transition-all font-bold placeholder:text-gray-300 text-sm"
                    placeholder="Contoh: ahmad_tkj"
                    required
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">@smkpu.id</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">KATA SANDI KEAMANAN</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-3xl transition-all font-bold placeholder:text-gray-300 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {view === 'register' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6 pt-2"
                >
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">NOMOR INDUK NASIONAL (NISN)</label>
                    <div className="relative">
                      <Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                      <input
                        type="text"
                        value={nisn}
                        onChange={(e) => setNisn(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-3xl transition-all font-bold placeholder:text-gray-300 text-sm"
                        placeholder="10 Digit NISN Resmi"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">KOMPETENSI KEAHLIAN (JURUSAN)</label>
                    <div className="relative">
                      <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                      <select
                        value={jurusan}
                        onChange={(e) => setJurusan(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-3xl transition-all font-bold text-sm appearance-none cursor-pointer"
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
            </div>

            <motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full py-6 bg-primary text-white rounded-3xl font-black text-base shadow-2xl shadow-red-200 hover:bg-primary-dark transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  {view === 'login' ? <Fingerprint size={24} /> : <UserPlus size={24} />}
                  {view === 'login' ? 'MASUK KE SISTEM' : 'DAFTARKAN IDENTITAS SISWA'}
                </>
              )}
            </motion.button>
          </form>

          {/* Setup section (Hidden/Cleaned up to be official) */}
          <div className="mt-14 pt-10 border-t border-gray-100 flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">Sistem Informasi Terpadu</p>
               <p className="text-[10px] font-bold text-gray-500">© 2024 SMK Prima Unggul. All Rights Reserved.</p>
            </div>
            
            {/* Optional Init Button (Small & Formal) */}
            <motion.button 
              onClick={handleBootstrap}
              disabled={bootstrapping}
              className="text-[9px] font-black text-gray-300 hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-widest"
            >
              {bootstrapping ? <Loader2 size={10} className="animate-spin" /> : <Database size={10} />}
              Initialize System Configuration
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
