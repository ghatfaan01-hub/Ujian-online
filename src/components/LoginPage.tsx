import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GraduationCap, Lock, User, AlertCircle, BookOpen, Fingerprint, Database, Loader2 } from 'lucide-react';
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
  const navigate = useNavigate();

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
      // In Supabase, we can sign in with email. We'll use the same email pattern.
      const email = username.includes('@') ? username : `${username}@smkprima.sch.id`;
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user?.id)
        .single();
      
      if (profileError || !profile) {
        throw new Error('Profil pengguna tidak ditemukan di database.');
      }

      // Validation for role-specific fields
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-red-50 text-primary rounded-2xl flex items-center justify-center mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">SMK Prima Unggul</h1>
          <p className="text-gray-500 font-medium tracking-tight">Pintu Masuk Sistem Akademik</p>
        </div>

        {/* Role Switcher */}
        <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
          <button 
            type="button"
            onClick={() => { setRole('siswa'); setError(''); }}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
              role === 'siswa' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Siswa (NISN)
          </button>
          <button 
            type="button"
            onClick={() => { setRole('guru'); setError(''); }}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
              role === 'guru' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Guru / Staff
          </button>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "mb-6 p-5 rounded-2xl flex flex-col gap-3 border shadow-sm",
                error.includes('Konfigurasi') 
                  ? "bg-orange-50 border-orange-100 text-orange-900" 
                  : "bg-red-50 border-red-100 text-red-900"
              )}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className={error.includes('Konfigurasi') ? "text-orange-600" : "text-red-600"} size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {error.includes('Konfigurasi') ? 'Konfigurasi Diperlukan' : 'Terjadi Kesalahan'}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed font-semibold opacity-80">{error}</p>
              
              {error.includes('Konfigurasi') && (
                <div className="mt-2 p-3 bg-white/60 rounded-xl border border-orange-200/50">
                  <p className="text-[10px] font-black text-orange-800 uppercase mb-2">Panduan Pengaturan:</p>
                  <ol className="text-[10px] list-decimal list-inside space-y-1.5 text-orange-700 font-bold">
                    <li>Dapatkan URL & Key di Dashboard Supabase</li>
                    <li>Buka <b>Settings &rarr; Secrets</b> di AI Studio/Vercel</li>
                    <li>Tambahkan <b>VITE_SUPABASE_URL</b></li>
                    <li>Tambahkan <b>VITE_SUPABASE_ANON_KEY</b></li>
                    <li>Refresh halaman dan coba lagi</li>
                  </ol>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent rounded-2xl transition-all font-semibold"
                placeholder="Ex: budi_prima"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent rounded-2xl transition-all font-semibold"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {role === 'siswa' && (
              <motion.div
                key="siswa-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5 overflow-hidden"
              >
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">NISN Siswa</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Fingerprint size={18} />
                    </div>
                    <input
                      type="text"
                      value={nisn}
                      onChange={(e) => setNisn(e.target.value)}
                      className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent rounded-2xl transition-all font-semibold"
                      placeholder="Masukkan 10 digit NISN"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Jurusan</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <BookOpen size={18} />
                    </div>
                    <select
                      value={jurusan}
                      onChange={(e) => setJurusan(e.target.value)}
                      className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent rounded-2xl appearance-none transition-all font-semibold"
                      required
                    >
                      <option value="">Pilih Jurusan</option>
                      <option value="TKJ">Teknik Komputer Jaringan (TKJ)</option>
                      <option value="DKV">Desain Komunikasi Visual (DKV)</option>
                      <option value="AK">Akuntansi (AK)</option>
                      <option value="BC">Broadcasting (BC)</option>
                      <option value="MPLB">Manajemen Perkantoran (MPLB)</option>
                      <option value="BD">Bisnis Digital (BD)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary-dark transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-3 active:scale-95"
          >
            {loading ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                Verifikasi...
              </>
            ) : (
              'Masuk Sekarang'
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Baru Pertama Kali?</p>
          <button 
            type="button"
            onClick={handleBootstrap}
            disabled={bootstrapping}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 text-gray-900 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {bootstrapping ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full"
              />
            ) : <Database size={14} />}
            SIAPKAN DATA & AKUN DEMO
          </button>
        </div>
      </motion.div>
    </div>
  );
}
