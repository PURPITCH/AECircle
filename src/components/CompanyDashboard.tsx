import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Building2, MapPin, Globe, Plus, Plane, Search, Briefcase, BookOpen, GraduationCap, User, Settings, LogOut, ChevronDown, Menu, X } from 'lucide-react';

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
      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${isActive(path) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}>
      <Icon className="w-4 h-4" />{label}
    </Link>
  );

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 h-14">

          {/* Logo dropdown */}
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity">
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
                <button onClick={() => { navigate('/co/dashboard'); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                  <Building2 className="w-4 h-4" /> My dashboard
                </button>
                <button onClick={() => { navigate('/co/profile'); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                  <User className="w-4 h-4" /> Edit profile
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
                <button onClick={() => { navigate('/co/settings'); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                  <Settings className="w-4 h-4" /> Account settings
                </button>
                <div className="border-t border-gray-700" />
                <button onClick={async () => { await supabase.auth.signOut(); navigate('/co'); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search engineers..."
                className="w-full bg-gray-700 border border-gray-600 rounded-md pl-9 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
           {navItem('/co/dashboard', 'Company', Building2)}
{navItem('/co/jobs', 'Jobs', Briefcase)}
{navItem('/co/trainings', 'Training', BookOpen)}
          </div>

          {/* Mobile button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-400 hover:text-white">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden flex flex-col gap-1 pb-3">
          {navItem('/co/dashboard', 'Company', Building2)}
{navItem('/co/jobs', 'Jobs', Briefcase)}
{navItem('/co/trainings', 'Training', BookOpen)}
          </div>
        )}
      </div>
    </nav>
  );
}

export const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/co'); return; }
      const { data } = await supabase.from('company_profiles').select('*').eq('user_id', user.id).maybeSingle();
      if (!data) { navigate('/co/register'); return; }
      setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <CompanyNav companyName={profile.entity_name} />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

        {/* Company header card */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
              <div className="relative group cursor-pointer w-full h-full" onClick={() => document.getElementById('logo-upload')?.click()}>
              {profile.logo_url
                ? <img src={profile.logo_url} alt={profile.entity_name} className="w-full h-full object-cover" />
                : <Building2 className="w-8 h-8" />
              }
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <span className="text-white text-xs">Upload logo</span>
              </div>
              <input id="logo-upload" type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) return;
                  const ext = file.name.split('.').pop();
                  const path = `logos/${user.id}/logo.${ext}`;
                  await supabase.storage.from('avatars').upload(path, file, { upsert: true });
                  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
                  const url = `${data.publicUrl}?t=${Date.now()}`;
                  await supabase.from('company_profiles').update({ logo_url: url }).eq('user_id', user.id);
                  setProfile({ ...profile, logo_url: url });
                }}
              />
            </div>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{profile.entity_name}</h1>
              <p className="text-blue-400 text-sm">{profile.entity_type}</p>
              <p className="text-gray-500 text-xs mt-0.5">{profile.activity}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>}
                {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 hover:text-blue-300"><Globe className="w-3 h-3" />{profile.website}</a>}
              </div>
         {profile.about && <p className="text-gray-400 text-sm mt-3">{profile.about}</p>}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                {profile.email && <span>📧 {profile.email}</span>}
                {profile.phone && <span>📞 {profile.phone}</span>}
                {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">LinkedIn</a>}
                {profile.affiliation && <span>🏢 {profile.affiliation}</span>}
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 flex-shrink-0">
              {profile.plan === 'free' ? 'Free plan' : 'Premium'}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-xs text-blue-500">aircraft.engineer/co/{profile.username}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active job posts', value: '0', action: 'Post a job' },
            { label: 'Applications received', value: '0', action: 'View all' },
            { label: 'Profile views', value: '0', action: 'Coming soon' },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 p-4 text-center">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              <p className="text-xs text-blue-400 mt-2 cursor-pointer hover:text-blue-300">{stat.action}</p>
            </div>
          ))}
        </div>

        {/* Active posts */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-blue-400">Active Posts</h2>
            <button className="flex items-center gap-1 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
              <Plus className="w-4 h-4" /> Post a job
            </button>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No active posts yet.</p>
            <p className="text-xs mt-1">Post your first job to start receiving applications from verified engineers.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompanyDashboard;
