import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Users, ClipboardCheck, GraduationCap, ArrowRight, ShieldCheck, Globe, Star, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const departments = [
    { name: 'TKJ', desc: 'Teknik Komputer & Jaringan', icon: BookOpen },
    { name: 'DKV', desc: 'Desain Komunikasi Visual', icon: Users },
    { name: 'AK', desc: 'Akuntansi & Keuangan', icon: ClipboardCheck },
    { name: 'BC', desc: 'Broadcasting & Perfilman', icon: GraduationCap },
    { name: 'MPLB', desc: 'Manajemen Perkantoran', icon: ShieldCheck },
    { name: 'BD', desc: 'Bisnis Digital', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Top Banner */}
      <div className="bg-gray-900 text-white py-2 text-center text-[10px] font-black uppercase tracking-[0.3em]">
        Portal Resmi Akademik SMK Prima Unggul Tangerang Selatan
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-red-100">
              <GraduationCap className="text-white" size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-gray-900 leading-none">SMK PRIMA UNGGUL</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Unggul • Kompeten • Mandiri</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#jurusan" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-widest">Jurusan</a>
            <a href="#fasilitas" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-widest">Fasilitas</a>
            <Link 
              to="/login" 
              className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <div className="flex items-center gap-2 mb-6">
               <Star className="text-yellow-400 fill-yellow-400" size={16} />
               <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Terakreditasi A (Unggul)</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 mb-8 leading-[0.9]">
              MENCETAK <br /> <span className="text-primary italic font-serif">PROFESIONAL</span> <br /> MASA DEPAN.
            </h1>
            <p className="text-lg text-gray-600 max-w-lg mb-12 font-medium leading-relaxed">
              Selamat datang di Portal Digital SMK Prima Unggul. Integrasi sistem pembelajaran mandiri, administrasi, dan ujian online untuk seluruh civitas akademika.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login" className="px-10 py-5 bg-primary text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                Masuk Portal Akademik <ArrowRight size={18} />
              </Link>
              <div className="flex items-center gap-4 px-6 py-4 bg-gray-50 rounded-3xl border border-gray-100">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />)}
                 </div>
                 <span className="text-xs font-bold text-gray-500">Bergabung dengan 1,000+ Siswa</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-gray-100 rounded-[4rem] overflow-hidden shadow-2xl relative border-8 border-white">
               <img 
                 src="https://images.unsplash.com/photo-1523050853063-91589436d66b?q=80&w=2070&auto=format&fit=crop" 
                 alt="Students" 
                 className="w-full h-full object-cover grayscale-[0.5] hover:grayscale-0 transition-all duration-700"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
               <div className="absolute bottom-10 left-10 right-10">
                  <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                     <p className="text-white font-bold italic">"Pendidikan adalah senjata paling ampuh untuk mengubah dunia."</p>
                  </div>
               </div>
            </div>
            {/* 3D Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </header>

      {/* Stats */}
      <section className="py-20 border-y border-gray-100">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: 'Siswa Aktif', val: '1,240+' },
              { label: 'Alumni Sukses', val: '5,000+' },
              { label: 'Partner Industri', val: '45+' },
              { label: 'Tahun Berdiri', val: '2008' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                 <p className="text-4xl font-black text-gray-900 mb-1 tracking-tighter">{stat.val}</p>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
         </div>
      </section>

      {/* Departments */}
      <section id="jurusan" className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-col items-center mb-20">
            <span className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-4">Core Competencies</span>
            <h2 className="text-5xl font-black text-gray-900 tracking-tight">PROGRAM KEAHLIAN UNGGULAN</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 text-left"
              >
                <div className="w-16 h-16 bg-gray-50 text-primary rounded-3xl flex items-center justify-center mb-8 border border-gray-50 group-hover:bg-primary group-hover:text-white transition-all">
                  <dept.icon size={32} />
                </div>
                <h3 className="text-2xl font-black mb-3 text-gray-900 tracking-tight">{dept.name}</h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-8">{dept.desc}</p>
                <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest">
                   Detail Kurikulum <ArrowRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[
                { title: 'Kurikulum Merdeka', desc: 'Sesuai dengan standar industri 4.0' },
                { title: 'Sertifikasi Keahlian', desc: 'Uji kompetensi nasional bersertifikat' },
                { title: 'Link & Match', desc: 'Penyaluran kerja langsung ke partner industri' },
                { title: 'Fasilitas Lab Lengkap', desc: 'Peralatan standar teknisi profesional' },
              ].map((f, i) => (
                <div key={i} className="flex gap-6">
                   <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle2 size={24} />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-gray-900 mb-1">{f.title}</h4>
                      <p className="text-sm font-medium text-gray-500">{f.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
              <div className="md:col-span-2">
                 <div className="flex items-center gap-3 mb-6">
                    <GraduationCap size={32} className="text-primary" />
                    <span className="text-2xl font-black">SMK PRIMA UNGGUL</span>
                 </div>
                 <p className="text-gray-400 font-medium max-w-sm mb-8 leading-relaxed">
                    Sekolah Menengah Kejuruan yang berfokus pada teknologi dan manajemen bisnis, melahirkan siswa yang siap kerja dan mandiri.
                 </p>
                 <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-all cursor-pointer">
                       <Globe size={18} />
                    </div>
                 </div>
              </div>
              
              <div>
                 <h5 className="text-sm font-black uppercase tracking-widest mb-6">Navigasi</h5>
                 <ul className="space-y-4 text-sm font-medium text-gray-400">
                    <li><a href="#" className="hover:text-primary">Profil Sekolah</a></li>
                    <li><a href="#" className="hover:text-primary">Struktur Organisasi</a></li>
                    <li><a href="#" className="hover:text-primary">Kontak Kami</a></li>
                 </ul>
              </div>

              <div>
                 <h5 className="text-sm font-black uppercase tracking-widest mb-6">Lokasi</h5>
                 <p className="text-sm font-medium text-gray-400 leading-relaxed italic">
                    Jl. Pondok Cabe Raya No. 4, Kec. Pamulang, Kota Tangerang Selatan, Banten.
                 </p>
              </div>
           </div>
           
           <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
             <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">© 2024 SMK Prima Unggul Tangerang Selatan. SMK PU BISA!</p>
             <div className="flex gap-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <a href="#" className="hover:text-primary">Kebijakan Privasi</a>
                <a href="#" className="hover:text-primary">Syarat & Ketentuan</a>
             </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
