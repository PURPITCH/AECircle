import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plane, Search, Briefcase, BookOpen, Building2, Menu, X, Settings, LogOut, User, Plus, Filter, Eye } from 'lucide-react';

const CATEGORIES = ['Certifying', 'Non-Certifying', 'Post Holder', 'Managerial', 'Compliance & Safety', 'Other'];
const JOB_TYPES = ['Full time', 'Contract', 'Freelance'];

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
              <span className="text-lg font-bold text-white hidden sm:block">Aircraft.Engineer</span>
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
            {navItem('/co/trainings', 'Training', BookOpen)}
          </div>
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

export const CompanyJobs: React.FC = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterTypes, setFilterTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/co'); return; }
      const { data: company } = await supabase.from('company_profiles').select('entity_name, id, logo_url').eq('user_id', user.id).maybeSingle();
      if (!company) { navigate('/co/register'); return; }
      setCompanyName(company.entity_name);
      setCompanyLogo(company.logo_url || '');
      const { data: jobData } = await supabase.from('job_posts').select('*').eq('company_id', company.id).order('created_at', { ascending: false });
      setJobs(jobData || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job post? This cannot be undone.')) return;
    await supabase.from('job_posts').delete().eq('id', id);
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const filteredJobs = jobs.filter(job => {
    if (keyword && !job.title.toLowerCase().includes(keyword.toLowerCase()) && !job.location?.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (filterCategories.length && !filterCategories.some(c => job.categories?.includes(c))) return false;
    if (filterTypes.length && !filterTypes.some(t => job.job_types?.includes(t))) return false;
    return true;
  });

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(a => a !== val) : [...arr, val]);
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-blue-400">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-gray-900">
      <CompanyNav companyName={companyName} />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-blue-400">Job Posts</h2>
              <p className="text-xs text-gray-500 mt-0.5">{filteredJobs.length} of {jobs.length} post{jobs.length !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={() => navigate('/co/jobs/post')}
              className="flex items-center gap-1 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
              <Plus className="w-4 h-4" /> Post a job
            </button>
          </div>

          {/* Search + Filter */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={keyword} onChange={e => setKeyword(e.target.value)}
                placeholder="Search by title or location..."
                className="w-full bg-gray-700 border border-gray-600 rounded-md pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:text-white'}`}>
              <Filter className="w-4 h-4" /> Filter
              {(filterCategories.length + filterTypes.length) > 0 && (
                <span className="bg-white text-blue-600 rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">
                  {filterCategories.length + filterTypes.length}
                </span>
              )}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-gray-700/50 rounded-lg p-4 mb-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => toggleFilter(filterCategories, c, setFilterCategories)}
                      className={`px-2.5 py-1 rounded-full text-xs transition-colors ${filterCategories.includes(c) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Job type</p>
                <div className="flex flex-wrap gap-1.5">
                  {JOB_TYPES.map(t => (
                    <button key={t} onClick={() => toggleFilter(filterTypes, t, setFilterTypes)}
                      className={`px-2.5 py-1 rounded-full text-xs transition-colors ${filterTypes.includes(t) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {(filterCategories.length + filterTypes.length) > 0 && (
                <button onClick={() => { setFilterCategories([]); setFilterTypes([]); }} className="text-xs text-red-400 hover:text-red-300">Clear filters</button>
              )}
            </div>
          )}

          {/* Job list */}
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">{jobs.length === 0 ? 'No job posts yet' : 'No posts match your search'}</p>
              {jobs.length === 0 && (
                <button onClick={() => navigate('/co/jobs/post')} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors">
                  Post a job — $159
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map(job => (
                <div key={job.id} className="border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Company logo */}
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                      {companyLogo
                        ? <img src={companyLogo} alt={companyName} className="w-full h-full object-cover" />
                        : companyName.charAt(0)
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p onClick={() => navigate(`/jobs/${job.job_code}`)} className="font-semibold text-white hover:text-blue-400 cursor-pointer transition-colors">{job.title}</p>
                          <p className="text-xs text-blue-400">{companyName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {job.location}{job.is_remote ? ' · Remote' : ''} · {job.job_types?.join(', ')}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-mono text-gray-500 block">{job.job_code}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${job.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {job.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.categories?.map((c: string) => <span key={c} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs">{c}</span>)}
                        {job.licenses?.slice(0,2).map((l: string) => <span key={l} className="px-2 py-0.5 bg-gray-600 text-gray-300 rounded-full text-xs">{l}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-700">
                    <button onClick={() => navigate(`/co/jobs/edit/${job.id}`)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                    <button onClick={() => navigate(`/jobs/${job.job_code}`)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"><Eye className="w-3 h-3" /> View</button>
                    <button onClick={() => handleDelete(job.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                    <span className="text-xs text-gray-600 ml-auto">{new Date(job.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyJobs;
