import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plane, Search, Briefcase, BookOpen, Building2, Menu, X, Settings, LogOut, User, Plus } from 'lucide-react';

function CompanyNav({ companyName }: { companyName: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', !darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const navItem = (path: string, label: string, Icon: any) => (
    <Link to={path} onClick={() => setMobileOpen(false)}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(path) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}>
      <Icon className="w-4 h-4" />{label}
    </Link>
  );

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 h-14">
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Plane className="h-6 w-6 text-blue-500" />
              <span className="text-lg font-bold text-white hidden sm:block">AECircle</span>
              <span className="text-gray-500 text-xs hidden sm:block">/ Co</span>
            </button>
            {menuOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-700">
                  <p className="text-xs text-white font-medium truncate">{companyName}</p>
                  <p className="text-xs text-gray-500">Company account</p>
                </div>
                <button onClick={() => { navigate('/co/dashboard'); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"><Building2 className="w-4 h-4" /> My dashboard</button>
                <button onClick={() => { navigate('/co/profile'); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"><User className="w-4 h-4" /> Edit profile</button>
                <div className="border-t border-gray-700" />
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-gray-300 flex items-center gap-2">{darkMode ? '🌙' : '🌟'} {darkMode ? 'Dark mode' : 'Light mode'}</span>
                  <button onClick={() => setDarkMode(!darkMode)} className={`relative inline-flex flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200 ${darkMode ? 'bg-blue-600' : 'bg-gray-400'}`}>
                    <span className={`inline-block w-4 h-4 mt-0.5 bg-white rounded-full shadow transform transition-transform duration-200 ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <div className="border-t border-gray-700" />
                <button onClick={() => { navigate('/co/settings'); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"><Settings className="w-4 h-4" /> Account settings</button>
                <div className="border-t border-gray-700" />
                <button onClick={async () => { await supabase.auth.signOut(); navigate('/co'); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"><LogOut className="w-4 h-4" /> Sign out</button>
              </div>
            )}
          </div>
          <div className="flex-1 max-w-sm mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search engineers..." className="w-full bg-gray-700 border border-gray-600 rounded-md pl-9 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {navItem('/co/dashboard', 'Company', Building2)}
            {navItem('/co/jobs', 'Jobs', Briefcase)}
            {navItem('/co/training', 'Training', BookOpen)}
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-400 hover:text-white">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden flex flex-col gap-1 pb-3">
            {navItem('/co/dashboard', 'Company', Building2)}
            {navItem('/co/jobs', 'Jobs', Briefcase)}
            {navItem('/co/training', 'Training', BookOpen)}
          </div>
        )}
      </div>
    </nav>
  );
}

export const CompanyTraining: React.FC = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/co'); return; }
      const { data } = await supabase.from('company_profiles').select('entity_name').eq('user_id', user.id).maybeSingle();
      if (!data) { navigate('/co/register'); return; }
      setCompanyName(data.entity_name);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-blue-400">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-gray-900">
      <CompanyNav companyName={companyName} />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-blue-400">Training Listings</h2>
            <button onClick={() => navigate('/co/training/post')}
              className="flex items-center gap-1 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
              <Plus className="w-4 h-4" /> Add training
            </button>
          </div>
          <div className="text-center py-16 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No training listings yet</p>
            <p className="text-xs mt-1">List your training courses to reach verified aviation engineers.</p>
            <button onClick={() => navigate('/co/training/post')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors">
              Add a training listing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyTraining;
