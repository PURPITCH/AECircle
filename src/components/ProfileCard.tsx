import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ExperienceSection } from './ExperienceSection';
import { LicenseSection } from './LicenseSection';
import { Loader2, Wrench } from 'lucide-react';

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
  const age = profile.date_of_birth ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / 31557600000) : null;
  const infoLine = [age ? `${age} years` : null, profile.citizenship, profile.sex].filter(Boolean).join(' · ');

  return (
    <div className="max-w-4xl mx-auto space-y-4">

      {/* Profile header */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <div className="flex items-start gap-4">

          {/* Square photo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-blue-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 overflow-hidden">
            {profile.photo_url
              ? <img src={profile.photo_url} alt={fullName} className="w-full h-full object-cover" />
              : <span>{fullName.charAt(0).toUpperCase() || '?'}</span>
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">{fullName}</h1>
            <p className="text-blue-400 font-medium text-sm">{profile.designation}</p>
            {infoLine && <p className="text-gray-400 text-sm mt-0.5">{infoLine}</p>}
            {profile.residency_status && <p className="text-gray-500 text-sm">{profile.residency_status}</p>}
            {profile.username && (
              <a href={`/cv/${profile.username}`} className="text-blue-500 text-xs mt-1 hover:text-blue-400 block">
                aircraft.engineer/cv/{profile.username}
              </a>
            )}

            {/* Contact — stacked on mobile */}
            <div className="flex flex-col sm:flex-row sm:gap-4 mt-2 gap-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>📧</span>
                <span className="blur-sm select-none text-gray-400">hidden@email.com</span>
                <span className="text-blue-500 cursor-pointer hover:text-blue-400 no-blur">[Premium]</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>📞</span>
                <span className="blur-sm select-none text-gray-400">+000 000 0000</span>
                <span className="text-blue-500 cursor-pointer hover:text-blue-400 no-blur">[Premium]</span>
              </div>
            </div>

            {/* Toolbox statement */}
            {profile.has_tool_box && (
              <div className="flex items-center gap-1.5 mt-2">
                <Wrench className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-gray-400">Has personal toolbox</span>
              </div>
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

    </div>
  );
};

export default ProfileCard;
