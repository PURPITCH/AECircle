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
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors">
            <Edit2 className="w-4 h-4"
