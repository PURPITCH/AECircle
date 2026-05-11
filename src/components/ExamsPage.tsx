import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Filter, MapPin, GraduationCap, ChevronRight, X, Star, Plus, Edit, Trash2, Mail, Phone, Building2 } from 'lucide-react';

const CATEGORIES = ['A','B1.1','B1.2','B1.3','B1.4','B2','B2L','B3','L1C','L1','L2C','L2','L3H','L3G','L4H','L4G','L5'];

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

export const ExamsPage: React.FC = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [userType, setUserType] = useState<'none' | 'engineer' | 'company'>('none');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: company } = await supabase.from('company_profiles').select('id').eq('user_id', user.id).maybeSingle();
        if (company) { setUserType('company'); setCompanyId(company.id); }
        else setUserType('engineer');
      }
      const { data } = await supabase
        .from('exam_posts')
        .select('*, company_profiles(entity_name, logo_url, location, username, id)')
        .eq('is_active', true)
        .order('is_premium', { ascending: false })
        .order('created_at', { ascending: false });
      setExams(data || []);
      if (data && data.length > 0) setSelectedExam(data[0]);
      setLoading(false);
    };
    init();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this exam listing?')) return;
    await supabase.from('exam_posts').delete().eq('id', id);
    setExams(prev => prev.filter(e => e.id !== id));
    if (selectedExam?.id === id) setSelectedExam(null);
  };

  const filtered = exams.filter(e => {
    if (keyword && !e.title.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (location && !e.location?.toLowerCase().includes(location.toLowerCase())) return false;
    if (filterCategories.length && !filterCategories.some(c => e.categories?.includes(c))) return false;
    return true;
  });

  const isOwnPost = (e: any) => userType === 'company' && e.company_profiles?.id === companyId;
  const daysAgo = (d: string) => {
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
 const formatTime = (t: string) => t ? `${t.replace(':', '')}HRS` : '';

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Search bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Exam title, category..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="relative min-w-36">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:text-white'}`}>
            <Filter className="w-4 h-4" />
            Filters {filterCategories.length > 0 && <span className="bg-white text-blue-600 rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">{filterCategories.length}</span>}
          </button>
          {userType === 'company' && (
            <button onClick={() => navigate('/co/exams/post')}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Post an exam
            </button>
          )}
          {userType === 'none' && (
            <button onClick={() => navigate('/')}
              className="px-4 py-2 border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white rounded-md text-sm font-medium transition-colors">
              Sign in
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {showFilters && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Filter exams</h3>
              <div className="flex gap-3">
                {filterCategories.length > 0 && <button onClick={() => setFilterCategories([])} className="text-xs text-red-400 hover:text-red-300">Clear all</button>}
                <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <CheckFilter label="Category" options={CATEGORIES} selected={filterCategories} onChange={setFilterCategories} />
          </div>
        )}

        <p className="text-xs text-gray-500 mb-3">{filtered.length} exam{filtered.length !== 1 ? 's' : ''} found</p>

        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading exams...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400 font-medium">No exams found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Exam list */}
            <div className="lg:col-span-2 space-y-2">
              {filtered.map(exam => (
                <div key={exam.id} onClick={() => setSelectedExam(exam)}
                  className={`bg-gray-800 rounded-xl border cursor-pointer transition-all p-4 ${selectedExam?.id === exam.id ? 'border-blue-500' : 'border-gray-700 hover:border-gray-500'}`}>
                  {exam.is_premium && <div className="flex items-center gap-1 text-amber-400 text-xs mb-2"><Star className="w-3 h-3 fill-current" /> Featured</div>}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                      {exam.company_profiles?.logo_url
                        ? <img src={exam.company_profiles.logo_url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                        : exam.company_profiles?.entity_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p onClick={e => { e.stopPropagation(); navigate(`/exams/${exam.exam_code}`); }}
                        className="font-semibold text-white text-sm hover:text-blue-400 cursor-pointer transition-colors truncate">
                        {exam.title}
                      </p>
                      <p className="text-blue-400 text-xs">{exam.company_profiles?.entity_name}</p>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                        {exam.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{exam.location}</span>}
                        {exam.authority_approval && <span>{exam.authority_approval}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exam.categories?.slice(0,4).map((c: string) => <span key={c} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">{c}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                    <span className="text-xs text-gray-600">{daysAgo(exam.created_at)}</span>
                    <div className="flex items-center gap-2">
                      {isOwnPost(exam) && (
                        <>
                          <button onClick={e => { e.stopPropagation(); navigate(`/co/exams/edit/${exam.id}`); }}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
                            <Edit className="w-3 h-3" /> Edit
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(exam.id); }}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-0.5">
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </>
                      )}
                      <span className="text-xs text-gray-600 font-mono">{exam.exam_code}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Exam detail panel */}
            {selectedExam && (
              <div className="lg:col-span-3 bg-gray-800 rounded-xl border border-gray-700 p-6 h-fit sticky top-20 overflow-y-auto max-h-screen">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                    {selectedExam.company_profiles?.logo_url
                      ? <img src={selectedExam.company_profiles.logo_url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                      : <Building2 className="w-7 h-7" />}
                  </div>
                  <div className="flex-1">
                    <h2 onClick={() => navigate(`/exams/${selectedExam.exam_code}`)}
                      className="text-xl font-bold text-white hover:text-blue-400 cursor-pointer transition-colors">
                      {selectedExam.title}
                    </h2>
                    <p className="text-blue-400">{selectedExam.company_profiles?.entity_name}</p>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                      {selectedExam.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedExam.location}</span>}
                      {selectedExam.location_map_link && <a href={selectedExam.location_map_link} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">📍 Map</a>}
                    </div>
                  </div>
                  {isOwnPost(selectedExam) && (
                    <button onClick={() => navigate(`/co/exams/edit/${selectedExam.id}`)}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 px-2 py-1 border border-blue-500/30 rounded">
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedExam.categories?.map((c: string) => <span key={c} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">{c}</span>)}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  {selectedExam.modules && <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Modules</p><p className="text-gray-300 text-xs">{selectedExam.modules}</p></div>}
                  {selectedExam.affiliated_part147 && <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Affiliated Part 147</p><p className="text-gray-300 text-xs">{selectedExam.affiliated_part147}</p></div>}
                  {selectedExam.authority_approval && <div><p className="text-xs text-gray-500 mb-1">Authority</p><p className="text-gray-300 text-xs">{selectedExam.authority_approval}</p></div>}
                  {selectedExam.max_students && <div><p className="text-xs text-gray-500 mb-1">Max students</p><p className="text-gray-300 text-xs">{selectedExam.max_students}</p></div>}
                  {selectedExam.show_price && selectedExam.price && <div><p className="text-xs text-gray-500 mb-1">Price</p><p className="text-green-400 text-xs font-medium">{selectedExam.price}</p></div>}
                  {selectedExam.visa_access && <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Visa & Access</p><p className="text-gray-300 text-xs">{selectedExam.visa_access}</p></div>}
                </div>

                {/* Timetable */}
                {selectedExam.timetable && selectedExam.timetable.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Timetable</p>
                    <div className="bg-gray-700/50 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-3 gap-2 px-3 py-1.5 text-xs font-medium text-gray-400 border-b border-gray-600">
                        <span>Date</span><span>Time</span><span>Module</span>
                      </div>
                      {selectedExam.timetable.map((row: any, i: number) => (
                        <div key={i} className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-gray-300 border-b border-gray-700/50 last:border-0">
                          <span>{formatDate(row.date)}</span>
                          <span>{formatTime(row.time)}</span>
                          <span>{row.module}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedExam.description && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <p className="text-gray-300 text-sm line-clamp-4 whitespace-pre-wrap">{selectedExam.description}</p>
                    <button onClick={() => navigate(`/exams/${selectedExam.exam_code}`)} className="text-xs text-blue-400 hover:text-blue-300 mt-1">Read more →</button>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">Ref: {selectedExam.exam_code}</p>
                  {userType === 'none' ? (
                    <button onClick={() => navigate('/')} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">Sign in to register</button>
                  ) : userType === 'engineer' ? (
                    <>
                      {selectedExam.apply_inhouse && <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">Register via AECircle</button>}
                      {selectedExam.apply_external_link && <a href={selectedExam.apply_external_link} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">Register on provider site <ChevronRight className="w-4 h-4" /></a>}
                      {selectedExam.apply_email && <a href={`mailto:${selectedExam.apply_email}?subject=Exam registration: ${selectedExam.title} (${selectedExam.exam_code})`} className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors"><Mail className="w-4 h-4" /> Contact by email</a>}
                      {selectedExam.apply_phone && <a href={`tel:${selectedExam.apply_phone}`} className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors"><Phone className="w-4 h-4" /> {selectedExam.apply_phone}</a>}
                    </>
                  ) : isOwnPost(selectedExam) ? (
                    <div className="text-center py-2 text-xs text-gray-500">This is your exam listing</div>
                  ) : (
                    <div className="text-center py-2 text-xs text-gray-500">Company accounts cannot register for exams</div>
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

export default ExamsPage;
