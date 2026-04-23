import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GraduationCap, Lock, User, AlertCircle, BookOpen, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function LoginPage() {
  const [role, setRole] = useState<'siswa' | 'guru'>('siswa');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nisn, setNisn] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-red-50 text-primary text-xs font-bold rounded-xl flex items-center gap-3 border border-red-100"
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </motion.div>
        )}

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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Butuh Bantuan?</p>
          <p className="text-sm font-bold text-primary italic">Lupa Password atau Belum Ada Akun?</p>
        </div>
      </motion.div>
    </div>
  );
}
