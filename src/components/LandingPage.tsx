import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Users, ClipboardCheck, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const departments = [
    { name: 'TKJ', desc: 'Teknik Komputer & Jaringan', icon: BookOpen },
    { name: 'DKV', desc: 'Desain Komunikasi Visual', icon: Users },
    { name: 'AK', desc: 'Akuntansi', icon: ClipboardCheck },
    { name: 'BC', desc: 'Broadcasting', icon: GraduationCap },
    { name: 'MPLB', desc: 'Manajemen Perkantoran', icon: ShieldCheck },
    { name: 'BD', desc: 'Bisnis Digital', icon: ArrowRight },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">SMK Prima Unggul</span>
        </div>
        <Link 
          to="/login" 
          className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-dark transition-colors shadow-lg shadow-red-200"
        >
          Masuk ke Aplikasi
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="relative py-20 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1 bg-red-100 text-primary text-sm font-semibold rounded-full mb-4">
            Terakreditasi A - Tangerang Selatan
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Mencetak Generasi <br /> <span className="text-primary italic font-serif">Unggul & Kompeten</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Platform Pembelajaran Mandiri, Ujian Online, dan Absensi Digital SMK Prima Unggul. Siap bersaing di era digital.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/login" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all">
              Hubungkan Akun
            </Link>
          </div>
        </motion.div>
      </header>

      {/* Departments */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Pilihan Jurusan Kami</h2>
            <p className="text-gray-600">6 Program Keahlian Unggulan yang relevan dengan dunia kerja.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-red-50 text-primary rounded-xl flex items-center justify-center mb-6">
                  <dept.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{dept.name}</h3>
                <p className="text-gray-500">{dept.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500">© 2026 SMK Prima Unggul Tangerang Selatan. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-gray-400 hover:text-primary transition-colors">Facebook</a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors">Website</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
