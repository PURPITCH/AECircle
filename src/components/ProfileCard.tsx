import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ExperienceSection } from './ExperienceSection';
import { LicenseSection } from './LicenseSection';
import { TrainingSection } from './TrainingSection';
import { ProjectsSection } from './ProjectsSection';
import { AdditionalInfo } from './AdditionalInfo';
import { Loader2 } from 'lucide-react';

const PremiumField: React.FC<{ icon: string; placeholder: string }> = ({ icon, placeholder }) => (
  <div className="flex items-center gap-1.5 text-sm group relative cursor-pointer">
    <span style={{ fontSize: '0.75em' }}>{icon}</span>
    <span className="blur-sm select-none text-gray-400 group-hover:blur-md transition-all">{placeholder}</span>
    <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs">🔒</span>
    <div className="absolute left-0 top-6 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
      Upgrade to Premium to view
    </div>
  </div>
);

export const ProfileCard: React.FC<{ profile: any }> = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/'); return; }
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="min-h-64 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-64 flex flex-col items-center justify-center text-center p-8">
      <h2 className="text-2xl font-bold text-white mb-3">Welcome to AECircle</h2>
      <p className="text-gray-400 mb-6">You haven't created your engineer profile yet.</p>
      <button onClick={() => navigate('/cv/create')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors">
        Create my profile
      </button>
    </div>
  );

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
  const age = profile.date_of_birth
    ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / 31557600000)
    : null;

  const infoItems = [
    profile.citizenship,
    profile.residency_status,
  ].filter(Boolean);

  const physicalItems = [
    age ? `${age} yrs` : null,
    profile.sex,
    profile.height ? `${profile.height}cm` : null,
    profile.weight ? `${profile.weight}kg` : null,
  ].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto space-y-4">

      {/* Profile header card */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <div className="flex gap-5">

          {/* Square photo */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-lg bg-blue-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {profile.photo_url
                ? <img src={profile.photo_url} alt={fullName} className="w-full h-full object-cover" />
                : <span>{fullName.charAt(0).toUpperCase() || '?'}</span>
              }
            </div>
          </div>

          {/* Info column */}
          <div className="flex-1 min-w-0 space-y-0.5">

            <h1 className="text-xl font-bold text-white leading-tight">{fullName}</h1>
            <p className="text-blue-400 font-medium text-sm">{profile.designation}</p>

            {infoItems.length > 0 && (
              <p className="text-gray-400 text-sm">{infoItems.join(' | ')}</p>
            )}

            {physicalItems.length > 0 && (
              <p className="text-gray-500 text-sm">{physicalItems.join(' | ')}</p>
            )}

            {/* Contact — premium locked */}
            <div className="pt-1 space-y-0.5">
              <PremiumField icon="📞" placeholder="+971 XXX XXX XXX" />
              <PremiumField icon="✉️" placeholder="email@example.com" />
            </div>

          </div>
        </div>

        {/* Below photo row */}
        <div className="mt-3 space-y-1">
          {profile.username && (
            <a href={`/cv/${profile.username}`} className="text-blue-500 text-xs hover:text-blue-400 block">
              aircraft.engineer/cv/{profile.username}
            </a>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            {profile.notice_period && (
              <span>Notice: <span className="text-gray-300">{profile.notice_period}</span></span>
            )}
            {profile.notice_period && profile.has_tool_box && <span>·</span>}
            {profile.has_tool_box && (
              <span className="flex items-center gap-1">
                <span style={{ fontSize: '0.85em' }}>🔧</span>
                <span className="text-gray-300">Personal Toolbox</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <ExperienceSection />
      </div>

      {/* Licenses */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <LicenseSection />
      </div>

      {/* Training */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <TrainingSection />
      </div>

      {/* Projects */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <ProjectsSection />
      </div>

      {/* Additional Info */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <AdditionalInfo />
      </div>

    </div>
  );
};

export default ProfileCard;
