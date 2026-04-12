import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Download } from 'lucide-react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b border-blue-100 pb-1 mb-3">{title}</h2>
    {children}
  </div>
);

export const PublicCV: React.FC = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .maybeSingle();

        if (!profileData) { setNotFound(true); return; }
        setProfile(profileData);

        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id === profileData.id) setIsOwner(true);

        const [expRes, licRes, trainRes, projRes] = await Promise.all([
          supabase.from('experiences').select('*').eq('user_id', profileData.id).order('is_current', { ascending: false }).order('start_date', { ascending: false }),
          supabase.from('licenses').select('*').eq('user_id', profileData.id),
          supabase.from('trainings').select('*').eq('user_id', profileData.id),
          supabase.from('projects').select('*').eq('user_id', profileData.id),
        ]);

        setExperiences(expRes.data || []);
        setLicenses(licRes.data || []);
        setTrainings(trainRes.data || []);
        setProjects(projRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile not found</h1>
      <p className="text-gray-500 mb-4">This profile doesn't exist or has been removed.</p>
      <button onClick={() => navigate('/')} className="text-blue-500 hover:text-blue-600">Go to AECircle</button>
    </div>
  );

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
  const age = profile.date_of_birth ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / 31557600000) : null;
  const infoItems = [profile.citizenship, profile.residency_status].filter(Boolean);
  const physicalItems = [age ? `${age} yrs` : null, profile.sex, profile.height ? `${profile.height}cm` : null, profile.weight ? `${profile.weight}kg` : null].filter(Boolean);

  const SECTION_ORDER = ['Post Holder', 'Certifying', 'Non-Certifying', 'Auditing'];
  const grouped = SECTION_ORDER.reduce((acc, cat) => {
    const items = experiences.filter(e => e.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, any[]>);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '';

  const getExpiryStatus = (expiry: string) => {
    if (!expiry) return null;
    const days = Math.floor((new Date(expiry).getTime() - Date.now()) / 86400000);
    if (days < 0) return { label: 'Expired', color: '#ef4444' };
    if (days <= 50) return { label: `Expires ${formatDate(expiry)}`, color: '#f59e0b' };
    return { label: `Valid until ${formatDate(expiry)}`, color: '#22c55e' };
  };

  const trainingByTab = (tab: string) => trainings.filter(t => t.tab === tab);

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">

      {/* Top bar — hidden on print */}
      <div className="print:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-blue-500 font-bold text-lg">✈ AECircle</span>
          <span className="text-gray-400 text-sm">/ {username}</span>
        </div>
        <div className="flex items-center gap-3">
          {isOwner && (
            <button onClick={() => navigate('/cv')} className="text-sm text-gray-500 hover:text-gray-700">
              ← My dashboard
            </button>
          )}
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* CV Document */}
      <div className="max-w-3xl mx-auto bg-white my-6 print:my-0 shadow-sm print:shadow-none p-8 print:p-6">

     {/* Header */}
        <div className="mb-6 pb-5 border-b border-gray-200">
          <div className="flex gap-5">
            <div className="w-36 rounded-lg bg-blue-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 overflow-hidden self-stretch">
              {profile.photo_url
                ? <img src={profile.photo_url} alt={fullName} className="w-full h-full object-cover" />
                : <span>{fullName.charAt(0).toUpperCase()}</span>
              }
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
              <p className="text-blue-600 font-medium">{profile.designation}</p>
              {infoItems.length > 0 && <p className="text-gray-600 text-sm mt-0.5">{infoItems.join(' | ')}</p>}
              {physicalItems.length > 0 && <p className="text-gray-500 text-sm">{physicalItems.join(' | ')}</p>}
              <div className="mt-2 space-y-0.5">
                {isOwner ? (
                  <>
                    {profile.phone && <p className="text-sm text-gray-600">📞 {profile.phone}</p>}
                    {profile.email && <p className="text-sm text-gray-600">✉️ {profile.email}</p>}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-400 flex items-center gap-1">📞 <span className="blur-sm">+000 000 0000</span> <span className="text-blue-500 text-xs ml-1">[Premium]</span></p>
                    <p className="text-sm text-gray-400 flex items-center gap-1">✉️ <span className="blur-sm">email@example.com</span> <span className="text-blue-500 text-xs ml-1">[Premium]</span></p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <a href={`/cv/${profile.username}`} className="text-blue-400 text-xs hover:text-blue-500 block">
              aircraft.engineer/cv/{profile.username}
            </a>
            <div className="flex flex-wrap gap-x-3 text-xs text-gray-500">
              {profile.notice_period && <span>Notice: {profile.notice_period}</span>}
              {profile.has_tool_box && <span>🔧 Toolbox</span>}
              {profile.location && <span>📍 {profile.location}</span>}
            </div>
          </div>
        </div>

               {/* Experience */}
        {Object.keys(grouped).length > 0 && (
          <Section title="Experience">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{category}</p>
                {items.map((exp, i) => (
                  <div key={i} className="mb-3 pl-3 border-l-2 border-blue-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{exp.role}</p>
                        <p className="text-gray-600 text-sm">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                        {exp.aircraft_types && <p className="text-gray-500 text-xs">{exp.aircraft_types}</p>}
                      </div>
                      <p className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </Section>
        )}

        {/* Licenses */}
        {licenses.length > 0 && (
          <Section title="Licenses & Endorsements">
            {licenses.map((lic, i) => {
              const status = getExpiryStatus(lic.expiry_date);
              return (
                <div key={i} className="mb-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800 text-sm">{lic.license_type}</p>
                    {status && <span className="text-xs" style={{ color: status.color }}>{status.label}</span>}
                  </div>
                  <p className="text-gray-500 text-xs">{lic.issuing_authority}</p>
                  {lic.type_ratings?.map((r: any, j: number) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-gray-600 mt-1 pl-3">
                      <span className="text-gray-400">└</span>
                      <span>{r.aircraft_type}{r.engine_type ? ` / ${r.engine_type}` : ''}</span>
                      {r.endorsed_date && <span className="text-gray-400">{formatDate(r.endorsed_date)}</span>}
                      {r.certified_tasks > 0 && <span className="text-gray-400">{r.certified_tasks} tasks</span>}
                      {r.verified && <span className="text-green-500 font-bold">✓</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </Section>
        )}

        {/* Training */}
        {trainings.length > 0 && (
          <Section title="Training & Education">
            {['Academic', 'Type Training', 'Continuous', 'Additional', 'Post Graduate', 'Language'].map(tab => {
              const items = trainingByTab(tab);
              if (!items.length) return null;
              return (
                <div key={tab} className="mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{tab}</p>
                  {items.map((t, i) => {
                    const status = getExpiryStatus(t.expiry_date);
                    const title = t.tab === 'Type Training'
                      ? `${t.aircraft_type}${t.engine_type ? ' / ' + t.engine_type : ''}`
                      : t.tab === 'Language'
                      ? `${t.language} — ${t.language_level}`
                      : (t.title === 'Other' ? t.other_specify : t.title);
                    return (
                      <div key={i} className="flex items-center justify-between py-0.5 pl-3 border-l-2 border-gray-100 mb-1">
                        <div>
                          <span className="text-gray-800 text-sm">{title}</span>
                          {t.level && <span className="text-gray-400 text-xs ml-2">{t.level}</span>}
                          {t.institution && <span className="text-gray-500 text-xs ml-2">· {t.institution}</span>}
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {t.date_completed && <span className="text-xs text-gray-400">{new Date(t.date_completed).getFullYear()}</span>}
                          {status && <span className="text-xs" style={{ color: status.color }}>{status.label}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </Section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <Section title="Projects">
            {projects.map((p, i) => (
              <div key={i} className="mb-3 pl-3 border-l-2 border-blue-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{p.title}</p>
                    {p.organisation && <p className="text-gray-500 text-xs">{p.organisation}</p>}
                    {p.brief && <p className="text-gray-500 text-xs mt-0.5">{p.brief}</p>}
                  </div>
                  <p className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {formatDate(p.start_date)} — {p.is_ongoing ? 'Ongoing' : formatDate(p.end_date)}
                  </p>
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">Generated by AECircle · aircraft.engineer</p>
          <p className="text-xs text-blue-400">aircraft.engineer/cv/{profile.username}</p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .blur-sm { filter: none !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
};

export default PublicCV;
