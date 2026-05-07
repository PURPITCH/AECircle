import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Filter, MapPin, Clock, Briefcase, ChevronRight, X, Star, Plus, Edit, Trash2, Mail, Building2, User, BookOpen, GraduationCap, Settings, LogOut, KeyRound, Menu } from 'lucide-react';

const CATEGORIES = ['Certifying', 'Non-Certifying', 'Post Holder', 'Managerial', 'Compliance & Safety', 'Other'];
const DEPARTMENTS = ['Line','Base','Line & Base','Workshop','NDT','Training','Tech Pub','Planning','Compliance','Safety','Stores / Logistics','Other'];
const JOB_TYPES = ['Full time', 'Contract', 'Freelance'];
const LICENSES = ['EASA Part 66 A','EASA Part 66 B1.1','EASA Part 66 B1.2','EASA Part 66 B1.3','EASA Part 66 B1.4','EASA Part 66 B2','EASA Part 66 C','FAA A&P','GCAA CAR 66','CAAS','CAAM','DGCA','No license required'];

const CheckFilter: React.FC<{ label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void }> = ({ label, options, selected, onChange }) => (
  <div className="mb-4">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button key={opt} type="button"
          onClick={() => onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])}
          className={`px-2.5 py-1 rounded-full text-xs transition-colors ${selected.includes(opt) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}>
          {opt}
        </button>
      ))}
    </div>
  </div>
);

export const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [aircraft, setAircraft] = useState('');
  const [expMin, setExpMin] = useState('');

  // User state
  const [userType, setUserType] = useState<'none' | 'engineer' | 'company'>('none');
  const [companyId, setCompanyId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    categories: [] as string[],
    departments: [] as string[],
    job_types: [] as string[],
    licenses: [] as string[],
  });

  useEffect(() => {
    const init = async () => {
      // Detect user type
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: company } = await supabase.from('company_profiles').select('id').eq('user_id', user.id).maybeSingle();
        if (company) {
          setUserType('company');
          setCompanyId(company.id);
        } else {
          setUserType('engineer');
        }
      }
      // Fetch all active jobs
      const { data } = await supabase
        .from('job_posts')
        .select('*, company_profiles(entity_name, logo_url, location, username, id)')
        .eq('is_active', true)
        .order('is_premium', { ascending: false })
        .order('created_at', { ascending: false });
      setJobs(data || []);
      if (data && data.length > 0) setSelectedJob(data[0]);
      setLoading(false);
    };
    init();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this job post? This cannot be undone.')) return;
    await supabase.from('job_posts').delete().eq('id', id);
    setJobs(prev => prev.filter(j => j.id !== id));
    if (selectedJob?.id === id) setSelectedJob(null);
  };

  const filteredJobs = jobs.filter(job => {
    if (keyword && !job.title.toLowerCase().includes(keyword.toLowerCase()) && !job.description?.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (location && !job.location?.toLowerCase().includes(location.toLowerCase())) return false;
    if (aircraft && !job.aircraft_types?.toLowerCase().includes(aircraft.toLowerCase())) return false;
    if (expMin && job.experience_min !== null && job.experience_min < parseInt(expMin)) return false;
    if (filters.categories.length && !filters.categories.some(c => job.categories?.includes(c))) return false;
    if (filters.departments.length && !filters.departments.some(d => job.departments?.includes(d))) return false;
    if (filters.job_types.length && !filters.job_types.some(t => job.job_types?.includes(t))) return false;
    if (filters.licenses.length && !filters.licenses.some(l => job.licenses?.includes(l))) return false;
    return true;
  });

  const activeFiltersCount = filters.categories.length + filters.departments.length + filters.job_types.length + filters.licenses.length;
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '';
  const daysAgo = (d: string) => {
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const isOwnPost = (job: any) => userType === 'company' && job.company_profiles?.id === companyId;

  return (
    <div className="min-h-screen bg-gray-900">
    

    {/* Search + Filter bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={keyword} onChange={e => setKeyword(e.target.value)}
              placeholder="Job title, keyword..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="relative min-w-36">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={location} onChange={e => setLocation(e.target.value)}
              placeholder="Location..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:text-white'}`}>
            <Filter className="w-4 h-4" />
            Filters {activeFiltersCount > 0 && <span className="bg-white text-blue-600 rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">{activeFiltersCount}</span>}
          </button>
          {userType === 'company' && (
            <button onClick={() => navigate('/co/jobs/post')}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Post a job
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Filter panel */}
        {showFilters && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Filter jobs</h3>
              <div className="flex gap-3">
                {activeFiltersCount > 0 && <button onClick={() => setFilters({ categories: [], departments: [], job_types: [], licenses: [] })} className="text-xs text-red-400 hover:text-red-300">Clear all</button>}
                <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <CheckFilter label="Category" options={CATEGORIES} selected={filters.categories} onChange={v => setFilters(f => ({...f, categories: v}))} />
                <CheckFilter label="Job type" options={JOB_TYPES} selected={filters.job_types} onChange={v => setFilters(f => ({...f, job_types: v}))} />
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Min experience (years)</p>
                  <input type="number" value={expMin} onChange={e => setExpMin(e.target.value)} placeholder="e.g. 3"
                    className="w-32 bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Aircraft type</p>
                  <input value={aircraft} onChange={e => setAircraft(e.target.value)} placeholder="e.g. B737, A320..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <CheckFilter label="Department" options={DEPARTMENTS} selected={filters.departments} onChange={v => setFilters(f => ({...f, departments: v}))} />
                <CheckFilter label="License" options={LICENSES} selected={filters.licenses} onChange={v => setFilters(f => ({...f, licenses: v}))} />
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 mb-3">{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found</p>

        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400 font-medium">No jobs found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Job list */}
            <div className="lg:col-span-2 space-y-2">
              {filteredJobs.map(job => (
                <div key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`bg-gray-800 rounded-xl border cursor-pointer transition-all p-4 ${selectedJob?.id === job.id ? 'border-blue-500' : 'border-gray-700 hover:border-gray-500'}`}>
                  {job.is_premium && <div className="flex items-center gap-1 text-amber-400 text-xs mb-2"><Star className="w-3 h-3 fill-current" /> Featured</div>}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                      {job.company_profiles?.logo_url
                        ? <img src={job.company_profiles.logo_url} alt="" className="w-full h-full object-cover" />
                        : job.company_profiles?.entity_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p onClick={e => { e.stopPropagation(); navigate(`/jobs/${job.job_code}`); }}
                        className="font-semibold text-white text-sm hover:text-blue-400 cursor-pointer transition-colors truncate">
                        {job.title}
                      </p>
                      <p className="text-blue-400 text-xs">{job.company_profiles?.entity_name}</p>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                        {job.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{job.location}</span>}
                        {job.is_remote && <span className="text-green-400">Remote</span>}
                        {job.job_types?.[0] && <span>{job.job_types[0]}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.categories?.slice(0,2).map((c: string) => <span key={c} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">{c}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                    <span className="text-xs text-gray-600">{daysAgo(job.created_at)}</span>
                    <div className="flex items-center gap-2">
                      {isOwnPost(job) && (
                        <>
                          <button onClick={e => { e.stopPropagation(); navigate(`/co/jobs/edit/${job.id}`); }}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
                            <Edit className="w-3 h-3" /> Edit
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(job.id); }}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-0.5">
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </>
                      )}
                      <span className="text-xs text-gray-600 font-mono">{job.job_code}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Job detail panel */}
            {selectedJob && (
              <div className="lg:col-span-3 bg-gray-800 rounded-xl border border-gray-700 p-6 h-fit sticky top-20">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                    {selectedJob.company_profiles?.logo_url
                      ? <img src={selectedJob.company_profiles.logo_url} alt="" className="w-full h-full object-cover" />
                      : <Building2 className="w-7 h-7" />}
                  </div>
                  <div className="flex-1">
                    <h2 onClick={() => navigate(`/jobs/${selectedJob.job_code}`)}
                      className="text-xl font-bold text-white hover:text-blue-400 cursor-pointer transition-colors">
                      {selectedJob.title}
                    </h2>
                    <p className="text-blue-400">{selectedJob.company_profiles?.entity_name}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      {selectedJob.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedJob.location}</span>}
                      {selectedJob.is_remote && <span className="text-green-400">Remote available</span>}
                      {selectedJob.deadline && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Deadline: {formatDate(selectedJob.deadline)}</span>}
                    </div>
                  </div>
                  {isOwnPost(selectedJob) && (
                    <button onClick={() => navigate(`/co/jobs/edit/${selectedJob.id}`)}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 px-2 py-1 border border-blue-500/30 rounded">
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedJob.categories?.map((c: string) => <span key={c} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs">{c}</span>)}
                  {selectedJob.job_types?.map((t: string) => <span key={t} className="px-2 py-0.5 bg-gray-600 text-gray-300 rounded-full text-xs">{t}</span>)}
                  {selectedJob.departments?.map((d: string) => <span key={d} className="px-2 py-0.5 bg-gray-700 text-gray-400 rounded-full text-xs">{d}</span>)}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  {selectedJob.licenses?.length > 0 && <div><p className="text-xs text-gray-500 mb-1">License</p><p className="text-gray-300 text-xs">{selectedJob.licenses.join(', ')}</p></div>}
                  {selectedJob.aircraft_types && <div><p className="text-xs text-gray-500 mb-1">Type endorsement</p><p className="text-gray-300 text-xs">{selectedJob.aircraft_types}</p></div>}
                  {selectedJob.license_authority && <div><p className="text-xs text-gray-500 mb-1">Issuing authority</p><p className="text-gray-300 text-xs">{selectedJob.license_authority}</p></div>}
                  {(selectedJob.experience_min !== null || selectedJob.experience_max !== null) && <div><p className="text-xs text-gray-500 mb-1">Experience</p><p className="text-gray-300 text-xs">{selectedJob.experience_min || 0}–{selectedJob.experience_max || '+'}  yrs</p></div>}
                  {selectedJob.working_hours && <div><p className="text-xs text-gray-500 mb-1">Hours</p><p className="text-gray-300 text-xs">{selectedJob.working_hours}</p></div>}
                  {selectedJob.show_salary && selectedJob.salary_range && <div><p className="text-xs text-gray-500 mb-1">Salary</p><p className="text-green-400 text-xs font-medium">{selectedJob.salary_range}</p></div>}
                  {(selectedJob.visa_sponsorship || selectedJob.visa_requirements) && <div><p className="text-xs text-gray-500 mb-1">Visa</p><p className="text-gray-300 text-xs">{selectedJob.visa_sponsorship ? '✓ Sponsorship available' : 'No sponsorship'}{selectedJob.visa_requirements ? ` · ${selectedJob.visa_requirements}` : ''}</p></div>}
                </div>

                {selectedJob.description && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <p className="text-gray-300 text-sm line-clamp-6 whitespace-pre-wrap">{selectedJob.description}</p>
                    <button onClick={() => navigate(`/jobs/${selectedJob.job_code}`)} className="text-xs text-blue-400 hover:text-blue-300 mt-1">Read more →</button>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">Ref: {selectedJob.job_code}</p>
                  {userType === 'none' ? (
                    <button onClick={() => navigate('/')} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
                      Sign in to apply
                    </button>
                  ) : userType === 'engineer' ? (
                    <>
                      {selectedJob.apply_inhouse && <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">Apply via AECircle</button>}
                      {selectedJob.apply_external_link && <a href={selectedJob.apply_external_link} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">View on company site <ChevronRight className="w-4 h-4" /></a>}
                      {selectedJob.apply_email && <a href={`mailto:${selectedJob.apply_email}?subject=Application for ${selectedJob.title} (${selectedJob.job_code})`} className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors"><Mail className="w-4 h-4" /> Send CV by email</a>}
                    </>
                  ) : isOwnPost(selectedJob) ? (
                    <div className="text-center py-2 text-xs text-gray-500">This is your job post</div>
                  ) : (
                    <div className="text-center py-2 text-xs text-gray-500">Company accounts cannot apply to jobs</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
