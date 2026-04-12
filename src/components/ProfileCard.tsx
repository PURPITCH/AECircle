import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ExperienceSection } from './ExperienceSection';
import { LicenseSection } from './LicenseSection';
import { TrainingSection } from './TrainingSection';
import { ProjectsSection } from './ProjectsSection';
import { AdditionalInfo } from './AdditionalInfo';
import { Loader2 } from 'lucide-react';
import { PhotoUpload } from './PhotoUpload';

const iconStyle = { fontSize: '0.8em', color: '#3b82f6' };

const PremiumField: React.FC<{ icon: string; placeholder: string }> = ({ icon, placeholder }) => (
  <div className="flex items-center gap-1.5 text-sm group relative cursor-pointer">
    <span style={iconStyle}>{icon}</span>
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

  const infoItems = [profile.citizenship, profile.residency_status].filter(Boolean);
  const physicalItems = [
    age ? `${age} yrs` : null,
    profile.sex,
    profile.height ? `${profile.height}cm` : null,
    profile.weight ? `${profile.weight}kg` : null,
  ].filter(Boolean);

  const bottomLine = [
    profile.notice_period ? `Notice: ${profile.notice_period}` : null,
    profile.has_tool_box ? '🔧 Personal Toolbox' : null,
    profile.location ? `📍 ${profile.location}` : null,
  ].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto space-y-4">

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <div className="flex gap-5">

          {/* Photo — clickable upload */}
          <PhotoUpload
            userId={profile.id}
            currentPhotoUrl={profile.photo_url}
            fullName={fullName}
            onUploadComplete={(url) => setProfile({ ...profile, photo_url: url })}
          />

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <h1 className="text-xl font-bold text-white leading-tight">{fullName}</h1>
            <p className="text-blue-400 font-medium text-sm">{profile.designation}</p>
            {infoItems.length > 0 && <p className="text-gray-400 text-sm">{infoItems.join(' | ')}</p>}
            {physicalItems.length > 0 && <p className="text-gray-500 text-sm">{physicalItems.join(' | ')}</p>}
            <div className="pt-1 space-y-0.5">
              <PremiumField icon="📞" placeholder="+971 XXX XXX XXX" />
              <PremiumField icon="✉️" placeholder="email@example.com" />
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-3 space-y-1">
          {profile.username && (
            <a href={`/cv/${profile.username}`} className="text-blue-500 text-xs hover:text-blue-400 block">
              aircraft.engineer/cv/{profile.username}
            </a>
          )}
          {bottomLine.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
              {bottomLine.map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-gray-600">|</span>}
                  <span style={{ color: item?.startsWith('🔧') || item?.startsWith('📍') ? '#3b82f6' : undefined }}>
                    {item}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5"><ExperienceSection /></div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5"><LicenseSection /></div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5"><TrainingSection /></div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5"><ProjectsSection /></div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5"><AdditionalInfo /></div>
    </div>
  );
};

export default ProfileCard;
