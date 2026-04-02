import React, { useState } from 'react';
import { Profile } from '../types';
import { calculateAge } from '../utils';
import { User, Briefcase, Wrench, Award, Car, Edit2 } from 'lucide-react';
import { EditProfile } from './EditProfile';

interface ProfileCardProps {
  profile: Profile;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const age = profile?.date_of_birth ? calculateAge(profile.date_of_birth) : null;

  if (!profile) {
    return (
      <div className="min-h-64 flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-bold text-white mb-3">Welcome to AECircle</h2>
        <p className="text-gray-400 mb-6">You haven't created your engineer profile yet.</p>
       <button onClick={() => window.location.assign('/cv/create')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors">
  Create my profile
</button>
          Create my profile
        </a>
      </div>
    );
  }

  if (isEditing) {
    return <EditProfile profile={profile} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-700">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <img
              src={profile.picture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'}
              alt={profile.name}
              className="w-32 h-32 rounded-full object-cover ring-2 ring-blue-500"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              <p className="text-lg text-blue-400 font-medium">{profile.designation}</p>
              <p className="text-gray-400">Age: {age != null ? age : 'N/A'} • {profile?.nationality || 'N/A'}</p>
              <p className="text-gray-400">{profile?.resident_status}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-400">
              <User className="w-5 h-5" />
              Personal Information
            </h2>
            <div className="mt-2 space-y-2 text-gray-300">
              <p><strong className="text-gray-200">Sex:</strong> {profile?.sex || 'N/A'}</p>
              <p><strong className="text-gray-200">Height:</strong> {profile?.height ? `${profile.height}cm` : 'N/A'}</p>
              <p><strong className="text-gray-200">Weight:</strong> {profile?.weight ? `${profile.weight}kg` : 'N/A'}</p>
              {profile?.medical_conditions?.length > 0 && (
                <div>
                  <strong className="text-gray-200">Medical Conditions:</strong>
                  <ul className="list-disc list-inside">
                    {profile.medical_conditions.map((condition, index) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-400">
              <Award className="w-5 h-5" />
              Licenses & Certifications
            </h2>
            <div className="mt-2 text-gray-300">
              {profile?.licenses?.map((license, index) => (
                <div key={index} className="mb-2">
                  <p><strong className="text-gray-200">{license.type}</strong></p>
                  <p className="text-gray-400">Issued by: {license.issuingAuthority}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-400">
              <Briefcase className="w-5 h-5" />
              Experience
            </h2>
            <div className="mt-4 space-y-6">
              <div>
                <h3 className="font-medium text-gray-200">Certifying Experience</h3>
                {profile?.certifying_experience?.map((exp, index) => (
                  <div key={index} className="mt-2 border-l-2 border-blue-500 pl-4">
                    <p className="font-medium text-gray-200">{exp.type}</p>
                    <p className="text-gray-400">{exp.description}</p>
                    <p className="text-sm text-gray-500">{exp.duration}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-medium text-gray-200">Non-Certifying Experience</h3>
                {profile?.non_certifying_experience?.map((exp, index) => (
                  <div key={index} className="mt-2 border-l-2 border-gray-600 pl-4">
                    <p className="font-medium text-gray-200">{exp.type}</p>
                    <p className="text-gray-400">{exp.description}</p>
                    <p className="text-sm text-gray-500">{exp.duration}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-400">
              <Wrench className="w-5 h-5" />
              Training & Tools
            </h2>
            <div className="mt-2 space-y-4">
              <div>
                <h3 className="font-medium text-gray-200">Training</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-200">Basic Training</h4>
                    <ul className="list-disc list-inside text-gray-300">
                      {profile?.basic_training?.map((training, index) => (
                        <li key={index}>{training}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-200">Continuous Training</h4>
                    <ul className="list-disc list-inside text-gray-300">
                      {profile?.continuous_training?.map((training, index) => (
                        <li key={index}>{training}</li>
                      ))}
                    </ul>
                  </div>
                  {profile?.company_training?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-200">Company Training</h4>
                      <ul className="list-disc list-inside text-gray-300">
                        {profile.company_training.map((training, index) => (
                          <li key={index}>{training}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-200">Tools</h3>
                <p className="text-gray-300">{profile?.has_tool_box ? 'Has own toolbox' : 'No personal toolbox'}</p>
              </div>
              {profile?.other_training?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-200">Other Training</h3>
                  <ul className="list-disc list-inside text-gray-300">
                    {profile.other_training.map((training, index) => (
                      <li key={index}>{training}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-2">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-400">
              <Car className="w-5 h-5" />
              Driver's Licenses
            </h2>
            <div className="mt-2 space-y-2">
              <p className="text-gray-300">
                <strong className="text-gray-200">Vehicle Type:</strong> {profile?.drivers_license?.vehicleType || 'N/A'}
              </p>
              <p className="text-gray-300">
                <strong className="text-gray-200">Issuing Countries:</strong> {profile?.drivers_license?.issuingCountry || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
