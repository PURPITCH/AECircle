import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, ChevronLeft, Building2 } from 'lucide-react';

const ENTITY_TYPES = ['AMO (Approved Maintenance Organisation)', 'Training Organisation', 'Recruitment Agency', 'Individual Recruiter'];
const ACTIVITIES = ['Recruitment only', 'Training only', 'Both recruitment and training'];

const inputClass = "block w-full rounded-md bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-gray-300 mb-1";

export const CompanyProfile: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [form, setForm] = useState({
    entity_name: '', entity_type: '', activity: '', affiliation: '',
    location: '', website: '', about: '', email: '', phone: '',
    linkedin: '', social_handles: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/co'); return; }
      const { data } = await supabase.from('company_profiles').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        setProfileId(data.id);
        setForm({
          entity_name: data.entity_name || '',
          entity_type: data.entity_type || '',
          activity: data.activity || '',
          affiliation: data.affiliation || '',
          location: data.location || '',
          website: data.website || '',
          about: data.about || '',
          email: data.email || '',
          phone: data.phone || '',
          linkedin: data.linkedin || '',
          social_handles: data.social_handles || '',
        });
      }
      setIsFetching(false);
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('company_profiles').update({ ...form, updated_at: new Date().toISOString() }).eq('user_id', user.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally { setIsLoading(false); }
  };

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  if (isFetching) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/co/dashboard')} className="text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Edit company profile</h1>
          {saved && <span className="text-xs text-green-400">Saved ✓</span>}
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Entity / Individual name *</label>
              <input required className={inputClass} value={form.entity_name} onChange={e => set('entity_name', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Entity type</label>
              <select className={inputClass} value={form.entity_type} onChange={e => set('entity_type', e.target.value)}>
                <option value="">Select type</option>
                {ENTITY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Activity</label>
              <select className={inputClass} value={form.activity} onChange={e => set('activity', e.target.value)}>
                <option value="">Select activity</option>
                {ACTIVITIES.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input className={inputClass} placeholder="e.g. London, UK" value={form.location} onChange={e => set('location', e.target.value)} maxLength={40} />
            </div>
            <div>
              <label className={labelClass}>Affiliation</label>
              <input className={inputClass} placeholder="e.g. Independent" value={form.affiliation} onChange={e => set('affiliation', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Website</label>
              <input className={inputClass} placeholder="https://yourcompany.com" value={form.website} onChange={e => set('website', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>About <span className="text-gray-500 text-xs">(max 300 chars)</span></label>
              <textarea className={inputClass} rows={3} value={form.about} onChange={e => set('about', e.target.value)} maxLength={300} />
              <p className="text-xs text-gray-600 mt-1">{form.about.length}/300</p>
            </div>
            <div>
              <label className={labelClass}>Contact email</label>
              <input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Contact phone</label>
              <input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>LinkedIn</label>
              <input className={inputClass} placeholder="linkedin.com/company/yourname" value={form.linkedin} onChange={e => set('linkedin', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Other social handles</label>
              <input className={inputClass} placeholder="e.g. @yourcompany" value={form.social_handles} onChange={e => set('social_handles', e.target.value)} />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save changes'}
            </button>
            <button type="button" onClick={() => navigate('/co/dashboard')}
              className="px-6 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
