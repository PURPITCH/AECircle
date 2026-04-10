import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { SignUp } from './components/SignUp';
import { ResetPassword } from './components/ResetPassword';
import { AuthCallback } from './components/AuthCallback';
import { ProfileCard } from './components/ProfileCard';
import { CreateProfile } from './components/CreateProfile';
import { supabase } from './lib/supabase';
import { Plane, Briefcase, BookOpen, GraduationCap, Search, User, KeyRound, EyeOff, Trash2, LogOut, Menu, X } from 'lucide-react';
import { PublicCV } from './components/PublicCV';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserEmail(data.user.email || '');
    });
  }, []);
useEffect(() => {
    document.documentElement.classList.toggle('light-mode', !darkMode);
  }, [darkMode]);
  
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setDeleteConfirm(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItem = (path: string, label: string, Icon: any) => (
    <Link to={path} onClick={() => setMobileOpen(false)}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${isActive(path) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}>
      <Icon className="w-4 h-4" />{label}
    </Link>
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 h-14">

          {/* Logo — clicking opens dropdown */}
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button onClick={() => { setMenuOpen(!menuOpen); setDeleteConfirm(false); }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Plane className="h-6 w-6 text-blue-500" />
              <span className="text-lg font-bold text-white hidden sm:block">AECircle</span>
            </button>

            {/* Dropdown under logo */}
            {menuOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-700">
                  <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                </div>
                <button onClick={() => { navigate('/cv'); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                  <User className="w-4 h-4" /> My CV
                </button>
                <button onClick={() => { navigate('/cv/create'); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                  <KeyRound className="w-4 h-4" /> Edit profile
                </button>
                <div className="border-t border-gray-700" />
               <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    {darkMode ? '🌙' : '🌟'} {darkMode ? 'Dark mode' : 'Light mode'}
                  </span>
                  <button onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200 ${darkMode ? 'bg-blue-600' : 'bg-gray-400'}`}>
                    <span className={`inline-block w-4 h-4 mt-0.5 bg-white rounded-full shadow transform transition-transform duration-200 ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <div className="border-t border-gray-700" />
                <button onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                  <EyeOff className="w-4 h-4" /> Hide my profile
                </button>
                <div className="border-t border-gray-700" />
                {!deleteConfirm ? (
                  <button onClick={() => setDeleteConfirm(true)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete account
                  </button>
                ) : (
                  <div className="px-4 py-3 bg-red-500/10">
                    <p className="text-xs text-red-400 mb-2">Are you sure? Cannot be undone.</p>
                    <div className="flex gap-2">
                      <button onClick={() => setDeleteConfirm(false)}
                        className="flex-1 text-xs py-1.5 border border-gray-600 text-gray-300 rounded hover:bg-gray-700">Cancel</button>
                      <button onClick={handleDeleteAccount}
                        className="flex-1 text-xs py-1.5 bg-red-600 hover:bg-red-700 text-white rounded">Delete</button>
                    </div>
                  </div>
                )}
                <div className="border-t border-gray-700" />
                <button onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            )}
          </div>

          {/* Search bar — centered */}
          <div className="flex-1 max-w-sm mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search engineers, jobs..."
                className="w-full bg-gray-700 border border-gray-600 rounded-md pl-9 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navItem('/cv', 'CV', User)}
            {navItem('/jobs', 'Jobs', Briefcase)}
            {navItem('/trainings', 'Trainings', BookOpen)}
            {navItem('/academy', 'Academy', GraduationCap)}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-400 hover:text-white">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden flex flex-col gap-1 pb-3">
            {navItem('/cv', 'CV', User)}
            {navItem('/jobs', 'Jobs', Briefcase)}
            {navItem('/trainings', 'Trainings', BookOpen)}
            {navItem('/academy', 'Academy', GraduationCap)}
          </div>
        )}
      </div>
    </nav>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-64 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>
        <p className="text-gray-400">Coming soon — we are building this for you.</p>
      </div>
    </div>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate('/');
      setChecking(false);
    });
  }, []);
  if (checking) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-blue-400">Loading...</div>
    </div>
  );
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/cv" element={<ProtectedRoute><AppLayout><ProfileCard profile={null} /></AppLayout></ProtectedRoute>} />
        <Route path="/cv/create" element={<ProtectedRoute><AppLayout><CreateProfile /></AppLayout></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><AppLayout><ComingSoon title="Aviation Jobs" /></AppLayout></ProtectedRoute>} />
        <Route path="/trainings" element={<ProtectedRoute><AppLayout><ComingSoon title="Trainings & Recurrency" /></AppLayout></ProtectedRoute>} />
        <Route path="/academy" element={<ProtectedRoute><AppLayout><ComingSoon title="AECircle Academy" /></AppLayout></ProtectedRoute>} />
        <Route path="/app/*" element={<ProtectedRoute><AppLayout><ProfileCard profile={null} /></AppLayout></ProtectedRoute>} />
        <Route path="/cv/:username" element={<PublicCV />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
