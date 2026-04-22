import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  ClipboardCheck, 
  BookOpenCheck,
  History,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function AppLayout() {
  const { profile, isAdmin, isGuru, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard, show: true },
    { name: 'Absensi Karyawan', path: '/app/attendance', icon: UserRound, show: true },
    { name: 'Absensi Siswa', path: '/app/attendance?type=siswa', icon: ClipboardCheck, show: isGuru },
    { name: 'Rekap Absensi', path: '/app/records', icon: History, show: isStaff },
    { name: 'Data Siswa', path: '/app/students', icon: GraduationCap, show: isAdmin },
    { name: 'Ujian Online', path: '/app/exams', icon: BookOpenCheck, show: true },
    { name: 'Manajemen User', path: '/app/users', icon: Users, show: isAdmin },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-8 border-b border-gray-50 mb-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-100">
              <GraduationCap size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-gray-900 leading-none">SMK PU</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest mt-1">Prima Unggul</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.filter(item => item.show).map((item) => {
            const isActive = location.pathname === item.path || 
                           (item.path !== '/app' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium group",
                  isActive 
                    ? "bg-red-50 text-primary shadow-sm" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon size={20} className={cn(isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-900")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 uppercase font-bold text-primary">
                {profile?.fullName?.charAt(0)}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-gray-900 truncate">{profile?.fullName}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  {profile?.role} • {profile?.department}
                </span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors bg-white rounded-lg border border-gray-100"
            >
              <LogOut size={14} />
              Logout Akun
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10">
          <h2 className="text-lg font-bold text-gray-900">
            {menuItems.find(item => item.path === location.pathname)?.name || 'Halaman'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-[10px] font-medium text-gray-400">Tangerang Selatan, Banten</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
