import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Building2, MapPin, Globe, Mail, Phone, Linkedin, Edit, Plus } from 'lucide-react';

export const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }
      const { data } = await supabase.from('company_profiles').select('*').eq('user_id', user.id).maybeSingle();
      if (!data) { navigate('/co/register'); return; }
      setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Nav */}
      <nav className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-blue-500 font-bold text-lg">✈ AECircle</span>
          <span className="text-gray-500 text-xs">/ Company</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/co/register" className="text-xs text-gray-400 hover:text-white">Edit profile</Link>
          <button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
            className="text-xs text-gray-400 hover:text-white">Sign out</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">

        {/* Company header */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {profile.logo_url
                ? <img src={profile.logo_url} alt={profile.entity_name} className="w-full h-full object-cover rounded-lg" />
                : <Building2 className="w-8 h-8" />
              }
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{profile.entity_name}</h1>
              <p className="text-blue-400 text-sm">{profile.entity_type}</p>
              <p className="text-gray-500 text-xs mt-0.5">{profile.activity}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>}
                {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 hover:text-blue-300"><Globe className="w-3 h-3" />{profile.website}</a>}
              </div>
              {profile.about && <p className="text-gray-400 text-sm mt-3">{profile.about}</p>}
            </div>
            <div className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
              {profile.plan === 'free' ? 'Free plan' : 'Premium'}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-xs text-blue-500">aircraft.engineer/co/{profile.username}</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active job posts', value: '0', action: 'Post a job' },
            { label: 'Applications received', value: '0', action: 'View all' },
            { label: 'Profile views', value: '0', action: 'Coming soon' },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 p-4 text-center">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              <p className="text-xs text-blue-400 mt-2 cursor-pointer hover:text-blue-300">{stat.action}</p>
            </div>
          ))}
        </div>

        {/* Active posts */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-blue-400">Active Posts</h2>
            <button className="flex items-center gap-1 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
              <Plus className="w-4 h-4" /> Post a job
            </button>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No active posts yet.</p>
            <p className="text-xs mt-1">Post your first job to start receiving applications from verified engineers.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompanyDashboard;
