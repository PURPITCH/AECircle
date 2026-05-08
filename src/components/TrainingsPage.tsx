import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Filter, MapPin, Clock, BookOpen, ChevronRight, X, Star, Plus, Edit, Trash2, Mail, Building2 } from 'lucide-react';

const COURSE_TYPES = ['Type Rating', 'Initial Training', 'Continuation Training', 'Recurrency', 'Academic', 'OJT', 'SOJT', 'Other'];

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

export const TrainingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [aircraft, setAircraft] = useState('');
  const [userType, setUserType] = useState<'none' | 'engineer' | 'company'>('none');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [filterTypes, setFilterTypes] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: company } = await supabase.from('company_profiles').select('id').eq('user_id', user.id).maybeSingle();
        if (company) { setUserType('company'); setCompanyId(company.id); }
        else setUserType('engineer');
      }
      const { data } = await supabase
        .from('training_posts')
        .select('*, company_profiles(entity_name, logo_url, location, username, id)')
        .eq('is_active', true)
        .order('is_premium', { ascending: false })
        .order('created_at', { ascending: false });
      setTrainings(data || []);
      if (data && data.length > 0) setSelectedTraining(data[0]);
      setLoading(false);
    };
    init();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this training listing?')) return;
    await supabase.from('training_posts').delete().eq('id', id);
    setTrainings(prev => prev.filter(t => t.id !== id));
    if (selectedTraining?.id === id) setSelectedTraining(null);
  };

  const filtered = trainings.filter(t => {
    if (keyword && !t.title.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (location && !t.location_theory?.toLowerCase().includes(location.toLowerCase()) && !t.location_practical?.toLowerCase().includes(location.toLowerCase())) return false;
    if (aircraft && !t.aircraft_type?.toLowerCase().includes(aircraft.toLowerCase())) return false;
    if (filterTypes.length && !filterTypes.some(ft => t.course_types?.includes(ft))) return false;
    return true;
  });

  const activeFiltersCount = filterTypes.length;
  const isOwnPost = (t: any) => userType === 'company' && t.company_profiles?.id === companyId;

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const daysAgo = (d: string) => {
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Search bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Course title, aircraft type..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="relative min-w-36">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="relative min-w-36">
            <input value={aircraft} onChange={e => setAircraft(e.target.value)} placeholder="Aircraft type..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:text-white'}`}>
            <Filter className="w-4 h-4" />
            Filters {activeFiltersCount > 0 && <span className="bg-white text-blue-600 rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">{activeFiltersCount}</span>}
          </button>
          {userType === 'company' && (
            <button onClick={() => navigate('/co/training/post')}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add training
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
        {/* Filter panel */}
        {showFilters && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Filter trainings</h3>
              <div className="flex gap-3">
                {activeFiltersCount > 0 && <button onClick={() => setFilterTypes([])} className="text-xs text-red-400 hover:text-red-300">Clear all</button>}
                <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <CheckFilter label="Course type" options={COURSE_TYPES} selected={filterTypes} onChange={setFilterTypes} />
          </div>
        )}

        <p className="text-xs text-gray-500 mb-3">{filtered.length} training{filtered.length !== 1 ? 's' : ''} found</p>

        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading trainings...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400 font-medium">No trainings found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Training list */}
            <div className="lg:col-span-2 space-y-2">
              {filtered.map(t => (
                <div key={t.id} onClick={() => setSelectedTraining(t)}
                  className={`bg-gray-800 rounded-xl border cursor-pointer transition-all p-4 ${selectedTraining?.id === t.id ? 'border-blue-500' : 'border-gray-700 hover:border-gray-500'}`}>
                  {t.is_premium && <div className="flex items-center gap-1 text-amber-400 text-xs mb-2"><Star className="w-3 h-3 fill-current" /> Featured</div>}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                      {t.company_profiles?.logo_url
                        ? <img src={t.company_profiles.logo_url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                        : t.company_profiles?.entity_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p onClick={e => { e.stopPropagation(); navigate(`/training/${t.training_code}`); }}
                        className="font-semibold text-white text-sm hover:text-blue-400 cursor-pointer transition-colors truncate">
                        {t.title}
                      </p>
                      <p className="text-blue-400 text-xs">{t.company_profiles?.entity_name}</p>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                        {t.location_theory && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{t.location_theory}</span>}
                        {t.duration && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{t.duration}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {t.course_types?.slice(0,2).map((c: string) => <span key={c} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">{c}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                    <span className="text-xs text-gray-600">{daysAgo(t.created_at)}</span>
                    <div className="flex items-center gap-2">
                      {isOwnPost(t) && (
                        <>
                          <button onClick={e => { e.stopPropagation(); navigate(`/co/training/edit/${t.id}`); }}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
                            <Edit className="w-3 h-3" /> Edit
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(t.id); }}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-0.5">
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </>
                      )}
                      <span className="text-xs text-gray-600 font-mono">{t.training_code}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Training detail panel */}
            {selectedTraining && (
              <div className="lg:col-span-3 bg-gray-800 rounded-xl border border-gray-700 p-6 h-fit sticky top-20">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                    {selectedTraining.company_profiles?.logo_url
                      ? <img src={selectedTraining.company_profiles.logo_url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                      : <Building2 className="w-7 h-7" />}
                  </div>
                  <div className="flex-1">
                    <h2 onClick={() => navigate(`/training/${selectedTraining.training_code}`)}
                      className="text-xl font-bold text-white hover:text-blue-400 cursor-pointer transition-colors">
                      {selectedTraining.title}
                    </h2>
                    <p className="text-blue-400">{selectedTraining.company_profiles?.entity_name}</p>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                      {selectedTraining.location_theory && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedTraining.location_theory}</span>}
                      {selectedTraining.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{selectedTraining.duration}</span>}
                    </div>
                  </div>
                  {isOwnPost(selectedTraining) && (
                    <button onClick={() => navigate(`/co/training/edit/${selectedTraining.id}`)}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 px-2 py-1 border border-blue-500/30 rounded">
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedTraining.course_types?.map((c: string) => <span key={c} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs">{c}</span>)}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  {selectedTraining.aircraft_type && <div><p className="text-xs text-gray-500 mb-1">Aircraft</p><p className="text-gray-300 text-xs">{selectedTraining.aircraft_type}</p></div>}
                  {selectedTraining.engine_type && <div><p className="text-xs text-gray-500 mb-1">Engine</p><p className="text-gray-300 text-xs">{selectedTraining.engine_type}</p></div>}
                  {selectedTraining.component && <div><p className="text-xs text-gray-500 mb-1">Component</p><p className="text-gray-300 text-xs">{selectedTraining.component}</p></div>}
                  {selectedTraining.level && <div><p className="text-xs text-gray-500 mb-1">Level</p><p className="text-gray-300 text-xs">{selectedTraining.level}</p></div>}
                  {selectedTraining.approval && <div><p className="text-xs text-gray-500 mb-1">Approval</p><p className="text-gray-300 text-xs">{selectedTraining.approval}</p></div>}
                  {selectedTraining.delivery && <div><p className="text-xs text-gray-500 mb-1">Delivery</p><p className="text-gray-300 text-xs">{selectedTraining.delivery}</p></div>}
                  {selectedTraining.location_practical && <div><p className="text-xs text-gray-500 mb-1">Practical location</p><p className="text-gray-300 text-xs">{selectedTraining.location_practical}</p></div>}
                  {selectedTraining.max_students && <div><p className="text-xs text-gray-500 mb-1">Max students</p><p className="text-gray-300 text-xs">{selectedTraining.max_students}</p></div>}
                  {selectedTraining.start_date && <div><p className="text-xs text-gray-500 mb-1">Start date</p><p className="text-gray-300 text-xs">{formatDate(selectedTraining.start_date)}{selectedTraining.is_ongoing ? ' · Ongoing' : selectedTraining.end_date ? ` → ${formatDate(selectedTraining.end_date)}` : ''}</p></div>}
                  {selectedTraining.show_price && selectedTraining.price && <div><p className="text-xs text-gray-500 mb-1">Price</p><p className="text-green-400 text-xs font-medium">{selectedTraining.price}</p></div>}
                  {selectedTraining.visa_access && <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Visa & Access</p><p className="text-gray-300 text-xs">{selectedTraining.visa_access}</p></div>}
                </div>

                {selectedTraining.description && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <p className="text-gray-300 text-sm line-clamp-5 whitespace-pre-wrap">{selectedTraining.description}</p>
                    <button onClick={() => navigate(`/training/${selectedTraining.training_code}`)} className="text-xs text-blue-400 hover:text-blue-300 mt-1">Read more →</button>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">Ref: {selectedTraining.training_code}</p>
                  {userType === 'none' ? (
                    <button onClick={() => navigate('/')} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">Sign in to book</button>
                  ) : userType === 'engineer' ? (
                    <>
                      {selectedTraining.apply_inhouse && <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">Book via AECircle</button>}
                      {selectedTraining.apply_external_link && <a href={selectedTraining.apply_external_link} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">Book on provider site <ChevronRight className="w-4 h-4" /></a>}
                      {selectedTraining.apply_email && <a href={`mailto:${selectedTraining.apply_email}?subject=Training enquiry: ${selectedTraining.title} (${selectedTraining.training_code})`} className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors"><Mail className="w-4 h-4" /> Contact by email</a>}
                    </>
                  ) : isOwnPost(selectedTraining) ? (
                    <div className="text-center py-2 text-xs text-gray-500">This is your training listing</div>
                  ) : (
                    <div className="text-center py-2 text-xs text-gray-500">Company accounts cannot book trainings</div>
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

export default TrainingsPage;
