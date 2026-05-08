import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, MapPin, Clock, ChevronRight, ArrowLeft, Star, Globe, Mail, Building2 } from 'lucide-react';

export const TrainingDetail: React.FC = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState<any>(null);
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
        .from('training_posts')
        .select('*, company_profiles(entity_name, logo_url, location, website, about, username)')
        .eq('training_code', code)
        .eq('is_active', true)
        .maybeSingle();
      if (!data) { setNotFound(true); setLoading(false); return; }
      setTraining(data);
      setLoading(false);
    };
    init();
  }, [code]);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const daysAgo = (d: string) => {
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (days === 0) return 'Posted today';
    if (days === 1) return 'Posted yesterday';
    return `Posted ${days} days ago`;
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;
  if (notFound) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-white mb-2">Training not found</h1>
      <p className="text-gray-400 mb-6">This listing may have expired or been removed.</p>
      <button onClick={() => navigate('/trainings')} className="text-blue-400 hover:text-blue-300">← Browse all trainings</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <span className="text-blue-500 font-bold text-lg">✈ AECircle</span>
        <button onClick={() => navigate('/trainings')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> All trainings
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">

            {/* Header */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              {training.is_premium && <div className="flex items-center gap-1 text-amber-400 text-xs mb-3"><Star className="w-3 h-3 fill-current" /> Featured listing</div>}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden">
                  {training.company_profiles?.logo_url
                    ? <img src={training.company_profiles.logo_url} alt="" className="w-full h-full object-cover" />
                    : <Building2 className="w-8 h-8" />}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white">{training.title}</h1>
                  <p className="text-blue-400 font-medium">{training.company_profiles?.entity_name}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                    {training.location_theory && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{training.location_theory}</span>}
                    {training.duration && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{training.duration}</span>}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{daysAgo(training.created_at)} · Ref: {training.training_code}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700">
                {training.course_types?.map((c: string) => <span key={c} className="px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">{c}</span>)}
              </div>
            </div>

            {/* Details */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-5">
              <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Course Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {training.aircraft_type && <div><p className="text-xs text-gray-500 mb-1">Aircraft type</p><p className="text-gray-300">{training.aircraft_type}</p></div>}
                {training.engine_type && <div><p className="text-xs text-gray-500 mb-1">Engine type</p><p className="text-gray-300">{training.engine_type}</p></div>}
                {training.component && <div><p className="text-xs text-gray-500 mb-1">Component</p><p className="text-gray-300">{training.component}</p></div>}
                {training.level && <div><p className="text-xs text-gray-500 mb-1">Level</p><p className="text-gray-300">{training.level}</p></div>}
                {training.approval && <div><p className="text-xs text-gray-500 mb-1">Approval</p><p className="text-gray-300">{training.approval}</p></div>}
                {training.delivery && <div><p className="text-xs text-gray-500 mb-1">Delivery</p><p className="text-gray-300">{training.delivery}</p></div>}
                {training.location_practical && <div><p className="text-xs text-gray-500 mb-1">Practical location</p><p className="text-gray-300">{training.location_practical}</p></div>}
                {training.max_students && <div><p className="text-xs text-gray-500 mb-1">Max students</p><p className="text-gray-300">{training.max_students}</p></div>}
                {training.start_date && <div><p className="text-xs text-gray-500 mb-1">Dates</p><p className="text-gray-300">{formatDate(training.start_date)}{training.is_ongoing ? ' · Ongoing' : training.end_date ? ` → ${formatDate(training.end_date)}` : ''}</p></div>}
                {training.show_price && training.price && <div><p className="text-xs text-gray-500 mb-1">Price</p><p className="text-green-400 font-medium">{training.price}</p></div>}
                {training.visa_access && <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Visa & Access</p><p className="text-gray-300">{training.visa_access}</p></div>}
              </div>
            </div>

            {training.description && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4">Course Description</h2>
                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{training.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 sticky top-20">
              <h3 className="text-sm font-semibold text-white mb-4">Book this course</h3>
              <div className="space-y-2">
                {userType === 'none' ? (
                  <button onClick={() => navigate('/')} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">Sign in to book</button>
                ) : userType === 'engineer' ? (
                  <>
                    {training.apply_inhouse && <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">Book via AECircle</button>}
                    {training.apply_external_link && <a href={training.apply_external_link} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">Book on provider site <ChevronRight className="w-4 h-4" /></a>}
                    {training.apply_email && <a href={`mailto:${training.apply_email}?subject=Training enquiry: ${training.title} (${training.training_code})`} className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors"><Mail className="w-4 h-4" /> Contact by email</a>}
                  </>
                ) : (
                  <div className="text-center py-2 text-xs text-gray-500">Company accounts cannot book trainings</div>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center">Ref: {training.training_code}</p>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-white mb-3">About the provider</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                  {training.company_profiles?.logo_url
                    ? <img src={training.company_profiles.logo_url} alt="" className="w-full h-full object-cover" />
                    : <Building2 className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{training.company_profiles?.entity_name}</p>
                  {training.company_profiles?.location && <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{training.company_profiles.location}</p>}
                </div>
              </div>
              {training.company_profiles?.about && <p className="text-xs text-gray-400 leading-relaxed mb-3">{training.company_profiles.about}</p>}
              {training.company_profiles?.website && <a href={training.company_profiles.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"><Globe className="w-3 h-3" /> {training.company_profiles.website}</a>}
              {training.company_profiles?.username && <Link to={`/co/${training.company_profiles.username}`} className="block text-xs text-blue-500 hover:text-blue-400 mt-2">View provider profile →</Link>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingDetail;
