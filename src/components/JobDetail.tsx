import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, MapPin, Clock, Briefcase, ChevronRight, ArrowLeft, Star, Globe, Mail, Building2 } from 'lucide-react';

export const JobDetail: React.FC = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('job_posts')
        .select('*, company_profiles(entity_name, logo_url, location, website, about, username)')
        .eq('job_code', code)
        .eq('is_active', true)
        .maybeSingle();
      if (!data) { setNotFound(true); setLoading(false); return; }
      setJob(data);
      setLoading(false);
    };
    fetch();
  }, [code]);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const daysAgo = (d: string) => {
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (days === 0) return 'Posted today';
    if (days === 1) return 'Posted yesterday';
    return `Posted ${days} days ago`;
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-white mb-2">Job not found</h1>
      <p className="text-gray-400 mb-6">This job may have expired or been removed.</p>
      <button onClick={() => navigate('/jobs')} className="text-blue-400 hover:text-blue-300">← Browse all jobs</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-blue-500 font-bold text-lg">✈ AECircle</span>
        </div>
        <button onClick={() => navigate('/jobs')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> All jobs
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">

            {/* Job header */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              {job.is_premium && (
                <div className="flex items-center gap-1 text-amber-400 text-xs mb-3">
                  <Star className="w-3 h-3 fill-current" /> Featured listing
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden">
                  {job.company_profiles?.logo_url
                    ? <img src={job.company_profiles.logo_url} alt="" className="w-full h-full object-cover" />
                    : <Building2 className="w-8 h-8" />
                  }
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white">{job.title}</h1>
                  <Link to={`/co/${job.company_profiles?.username}`} className="text-blue-400 hover:text-blue-300 font-medium">
                    {job.company_profiles?.entity_name}
                  </Link>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                    {job.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>}
                    {job.is_remote && <span className="text-green-400">Remote available</span>}
                    {job.deadline && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />Deadline: {formatDate(job.deadline)}</span>}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{daysAgo(job.created_at)} · Ref: {job.job_code}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700">
                {job.categories?.map((c: string) => <span key={c} className="px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">{c}</span>)}
                {job.job_types?.map((t: string) => <span key={t} className="px-2.5 py-1 bg-gray-600 text-gray-300 rounded-full text-xs">{t}</span>)}
                {job.departments?.map((d: string) => <span key={d} className="px-2.5 py-1 bg-gray-700 text-gray-400 rounded-full text-xs">{d}</span>)}
              </div>
            </div>

            {/* Job details */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-5">
              <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Requirements</h2>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {job.licenses?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">License required</p>
                    <p className="text-gray-300">{job.licenses.join(', ')}</p>
                  </div>
                )}
                {job.aircraft_types && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Type endorsement</p>
                    <p className="text-gray-300">{job.aircraft_types}</p>
                  </div>
                )}
                {job.license_authority && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Issuing authority</p>
                    <p className="text-gray-300">{job.license_authority}</p>
                  </div>
                )}
                {job.experience_type && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Experience type</p>
                    <p className="text-gray-300">{job.experience_type}</p>
                  </div>
                )}
                {(job.experience_min !== null || job.experience_max !== null) && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Experience</p>
                    <p className="text-gray-300">{job.experience_min || 0}–{job.experience_max || '+'} years</p>
                  </div>
                )}
                {job.working_hours && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Working hours</p>
                    <p className="text-gray-300">{job.working_hours}</p>
                  </div>
                )}
                {job.show_salary && job.salary_range && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Salary</p>
                    <p className="text-green-400 font-medium">{job.salary_range}</p>
                  </div>
                )}
                {(job.visa_sponsorship !== null || job.visa_requirements) && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Visa / Work permit</p>
                    <p className="text-gray-300">
                      {job.visa_sponsorship ? '✓ Sponsorship available' : '✗ No sponsorship'}
                      {job.visa_requirements && <span className="block text-xs text-gray-400 mt-0.5">{job.visa_requirements}</span>}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {job.description && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4">Job Description</h2>
                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{job.description}</p>
              </div>
            )}

            {/* Other requirements */}
            {job.other_requirements?.length > 0 && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4">Other Requirements</h2>
                <ul className="space-y-2">
                  {job.other_requirements.map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-blue-400 mt-0.5">•</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Apply card */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 sticky top-20">
              <h3 className="text-sm font-semibold text-white mb-4">Apply for this role</h3>
              <div className="space-y-2">
                {job.apply_inhouse && (
                  <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
                    Apply via AECircle
                  </button>
                )}
                {job.apply_external_link && (
                  <a href={job.apply_external_link} target="_blank" rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">
                    View on company site <ChevronRight className="w-4 h-4" />
                  </a>
                )}
                {job.apply_email && (
                  <a href={`mailto:${job.apply_email}?subject=Application: ${job.title} (${job.job_code})`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">
                    <Mail className="w-4 h-4" /> Send CV by email
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center">Ref: {job.job_code}</p>
            </div>

            {/* Company card */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-white mb-3">About the company</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                  {job.company_profiles?.logo_url
                    ? <img src={job.company_profiles.logo_url} alt="" className="w-full h-full object-cover" />
                    : <Building2 className="w-5 h-5" />
                  }
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{job.company_profiles?.entity_name}</p>
                  {job.company_profiles?.location && <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{job.company_profiles.location}</p>}
                </div>
              </div>
              {job.company_profiles?.about && <p className="text-xs text-gray-400 leading-relaxed mb-3">{job.company_profiles.about}</p>}
              {job.company_profiles?.website && (
                <a href={job.company_profiles.website} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                  <Globe className="w-3 h-3" /> {job.company_profiles.website}
                </a>
              )}
              {job.company_profiles?.username && (
                <Link to={`/co/${job.company_profiles.username}`} className="block text-xs text-blue-500 hover:text-blue-400 mt-2">
                  View company profile →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
