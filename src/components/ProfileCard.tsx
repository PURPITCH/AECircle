import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, Briefcase, Wrench, Award, Car, Edit2, Loader2 } from 'lucide-react';
import { ExperienceSection } from './ExperienceSection';
import { LicenseSection } from './LicenseSection';
import { TrainingSection } from './TrainingSection';

export const ProfileCard: React.FC<{ profile: any }> = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/'); return; }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
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

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-700">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold ring-2 ring-blue-500">
              {fullName.charAt(0) || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{fullName || 'No name'}</h1>
              <p className="text-lg text-blue-400 font-medium">{profile.designation || 'No designation'}</p>
              <p className="text-gray-400">
                {age ? `${age} years` : ''}{age && profile.citizenship ? ' • ' : ''}{profile.citizenship || ''}
              </p>
            {profile.username && (
  <a href={`/cv/${profile.username}`} className="text-blue-500 text-sm mt-1 hover:text-blue-400 transition-colors">
  aircraft.engineer/cv/{profile.username}
</a>
)}
            </div>
          </div>
          <button onClick={() => navigate('/cv/create')} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors">
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-400 mb-3">
              <User className="w-5 h-5" /> Personal Information
            </h2>
            <div className="space-y-2 text-gray-300 text-sm">
              <p><strong className="text-gray-200">Sex:</strong> {profile.sex || 'N/A'}</p>
              <p><strong className="text-gray-200">Height:</strong> {profile.height ? `${profile.height} cm` : 'N/A'}</p>
              <p><strong className="text-gray-200">Weight:</strong> {profile.weight ? `${profile.weight} kg` : 'N/A'}</p>
              <p><strong className="text-gray-200">Toolbox:</strong> {profile.has_tool_box ? 'Yes' : 'No'}</p>
            </div>
          </div>

         
          <div className="col-span-2">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-400 mb-3">
              <Briefcase className="w-5 h-5" /> Experience
            </h2>
            {profile.certifying_experience?.length > 0 ? (
              profile.certifying_experience.map((exp: any, i: number) => (
                <div key={i} className="mt-2 border-l-2 border-blue-500 pl-4 mb-3">
                  <p className="font-medium text-gray-200 text-sm">{exp.type}</p>
                  <p className="text-gray-400 text-sm">{exp.description}</p>
                  <p className="text-gray-500 text-xs">{exp.duration}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No experience added yet</p>
            )}
          </div>

          <div className="col-span-2">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-400 mb-3">
              <Wrench className="w-5 h-5" /> Training
            </h2>
            {profile.basic_training?.length > 0 ? (
              <ul className="list-disc list-inside text-gray-300 text-sm">
                {profile.basic_training.map((t: any, i: number) => <li key={i}>{t}</li>)}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No training added yet</p>
            )}
          </div>

          <div className="col-span-2">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-400 mb-3">
              <Car className="w-5 h-5" /> Driver's License
            </h2>
            <p className="text-gray-300 text-sm">
              {profile.drivers_license?.vehicleType || 'N/A'} — {profile.drivers_license?.issuingCountry || 'N/A'}
            </p>
          </div>
        </div>
      </div>
      <TrainingSection />
      <ExperienceSection />
      <LicenseSection />
    </div>
  );
};

export default ProfileCard;
