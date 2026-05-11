import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, MapPin, ArrowLeft, Star, Globe, Mail, Phone, Building2, ChevronRight } from 'lucide-react';

export const ExamDetail: React.FC = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [userType, setUserType] = useState<'none' | 'engineer' | 'company'>('none');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: company } = await supabase.from('company_profiles').select('id').eq('user_id', user.id).maybeSingle();
        setUserType(company ? 'company' : 'engineer');
      }
      const { data } = await supabase
        .from('exam_posts')
        .select('*, company_profiles(entity_name, logo_url, location, website, about, username)')
        .eq('exam_code', code)
        .eq('is_active', true)
        .maybeSingle();
      if (!data) { setNotFound(true); setLoading(false); return; }
      setExam(data);
      setLoading(false);
    };
    init();
  }, [code]);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const daysAgo = (d: string) => {
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (days === 0) return 'Posted today';
    if (days === 1) return 'Posted yesterday';
    return `Posted ${days} days ago`;
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;
  if (notFound) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-white mb-2">Exam not found</h1>
      <p className="text-gray-400 mb-6">This listing may have expired or been removed.</p>
      <button onClick={() => navigate('/exams')} className="text-blue-400 hover:text-blue-300">← Browse all exams</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <span className="text-blue-500 font-bold text-lg">✈ AECircle</span>
        <button onClick={() => navigate('/exams')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> All exams
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">

            {/* Header */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              {exam.is_premium && <div className="flex items-center gap-1 text-amber-400 text-xs mb-3"><Star className="w-3 h-3 fill-current" /> Featured listing</div>}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden">
                  {exam.company_profiles?.logo_url
                    ? <img src={exam.company_profiles.logo_url} alt="" className="w-full h-full object-cover" />
                    : <Building2 className="w-8 h-8" />}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white">{exam.title}</h1>
                  <p className="text-blue-400 font-medium">{exam.company_profiles?.entity_name}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                    {exam.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{exam.location}</span>}
                    {exam.location_map_link && <a href={exam.location_map_link} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">📍 View on map</a>}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{daysAgo(exam.created_at)} · Ref: {exam.exam_code}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700">
                {exam.categories?.map((c: string) => <span key={c} className="px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">{c}</span>)}
              </div>
            </div>

            {/* Details */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
              <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Exam Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {exam.modules && <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Modules</p><p className="text-gray-300">{exam.modules}</p></div>}
                {exam.affiliated_part147 && <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Affiliated Part 147 organisation</p><p className="text-gray-300">{exam.affiliated_part147}</p></div>}
                {exam.authority_approval && <div><p className="text-xs text-gray-500 mb-1">Authority approval</p><p className="text-gray-300">{exam.authority_approval}</p></div>}
                {exam.max_students && <div><p className="text-xs text-gray-500 mb-1">Max students</p><p className="text-gray-300">{exam.max_students}</p></div>}
                {exam.show_price && exam.price && <div><p className="text-xs text-gray-500 mb-1">Price</p><p className="text-green-400 font-medium">{exam.price}</p></div>}
                {exam.visa_access && <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Visa & Access</p><p className="text-gray-300">{exam.visa_access}</p></div>}
              </div>
            </div>

            {/* Timetable */}
            {exam.timetable && exam.timetable.length > 0 && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4">Timetable</h2>
                <div className="bg-gray-700/50 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs font-semibold text-gray-400 border-b border-gray-600 uppercase tracking-wider">
                    <span>Date</span><span>Time</span><span>Module / Subject</span>
                  </div>
                  {exam.timetable.map((row: any, i: number) => (
                    <div key={i} className="grid grid-cols-3 gap-2 px-4 py-2.5 text-sm text-gray-300 border-b border-gray-700/50 last:border-0 hover:bg-gray-700/30">
                      <span>{formatDate(row.date)}</span>
                      <span>{row.time ? `${row.time.replace(':', '')}HRS` : ''}</span>
                      <span>{row.module}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {exam.description && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4">Description</h2>
                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{exam.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 sticky top-20">
              <h3 className="text-sm font-semibold text-white mb-4">Register for this exam</h3>
              <div className="space-y-2">
                {userType === 'none' ? (
                  <button onClick={() => navigate('/')} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">Sign in to register</button>
                ) : userType === 'engineer' ? (
                  <>
                    {exam.apply_inhouse && <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">Register via AECircle</button>}
                    {exam.apply_external_link && <a href={exam.apply_external_link} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">Register on provider site <ChevronRight className="w-4 h-4" /></a>}
                    {exam.apply_email && <a href={`mailto:${exam.apply_email}?subject=Exam registration: ${exam.title} (${exam.exam_code})`} className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors"><Mail className="w-4 h-4" /> Contact by email</a>}
                    {exam.apply_phone && <a href={`tel:${exam.apply_phone}`} className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors"><Phone className="w-4 h-4" /> {exam.apply_phone}</a>}
                  </>
                ) : (
                  <div className="text-center py-2 text-xs text-gray-500">Company accounts cannot register for exams</div>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center">Ref: {exam.exam_code}</p>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-white mb-3">About the provider</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                  {exam.company_profiles?.logo_url
                    ? <img src={exam.company_profiles.logo_url} alt="" className="w-full h-full object-cover" />
                    : <Building2 className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{exam.company_profiles?.entity_name}</p>
                  {exam.company_profiles?.location && <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{exam.company_profiles.location}</p>}
                </div>
              </div>
              {exam.company_profiles?.about && <p className="text-xs text-gray-400 leading-relaxed mb-3">{exam.company_profiles.about}</p>}
              {exam.company_profiles?.website && <a href={exam.company_profiles.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"><Globe className="w-3 h-3" /> {exam.company_profiles.website}</a>}
              {exam.company_profiles?.username && <Link to={`/co/${exam.company_profiles.username}`} className="block text-xs text-blue-500 hover:text-blue-400 mt-2">View provider profile →</Link>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetail;
