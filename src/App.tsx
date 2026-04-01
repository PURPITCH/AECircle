import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { SignUp } from './components/SignUp';
import { ResetPassword } from './components/ResetPassword';
import { AuthCallback } from './components/AuthCallback';
import { ProfileCard } from './components/ProfileCard';
import { CreateProfile } from './components/CreateProfile';
import { supabase } from './lib/supabase';
import { Plane, User, Briefcase, BookOpen, GraduationCap, LogOut } from 'lucide-react';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserName(data.user.email || '');
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItem = (path, label, Icon) => {
    const active = location.pathname === path;
    return (
      <Link to={path} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}>
        <Icon className="w-4 h-4" />{label}
      </Link>
    );
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/cv" className="flex items-center gap-2">
              <Plane className="h-7 w-7 text-blue-500" />
              <span className="text-xl font-bold text-white">AECircle</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItem('/cv', 'My CV', User)}
              {navItem('/jobs', 'Jobs', Briefcase)}
              {navItem('/trainings', 'Trainings', BookOpen)}
              {navItem('/academy', 'Academy', GraduationCap)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">{userName}</span>
            <button onClick={handleSignOut} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors">
              <LogOut className="w-4 h-4" />Sign out
            </button>
          </div>
        </div>
        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
          {navItem('/cv', 'My CV', User)}
          {navItem('/jobs', 'Jobs', Briefcase)}
          {navItem('/trainings', 'Trainings', BookOpen)}
          {navItem('/academy', 'Academy', GraduationCap)}
        </div>
      </div>
    </nav>
  );
}

function ComingSoon({ title }) {
  return (
    <div className="min-h-64 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-3">{title}</h1>
        <p className="text-gray-400">Coming soon — we are building this for you.</p>
      </div>
    </div>
  );
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

function ProtectedRoute({ children }) {
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
      <div className="text-blue-400 text-lg">Loading AECircle...</div>
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
        <Route path="/trainings" element={<ProtectedRoute><AppLayout><ComingSoon title="Trainings and Recurrency" /></AppLayout></ProtectedRoute>} />
        <Route path="/academy" element={<ProtectedRoute><AppLayout><ComingSoon title="AECircle Academy — EASA Part 66" /></AppLayout></ProtectedRoute>} />
        <Route path="/app/*" element={<ProtectedRoute><AppLayout><ProfileCard profile={null} /></AppLayout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
