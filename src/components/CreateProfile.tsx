import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const CreateProfile: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingUsername, setExistingUsername] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    designation: '',
    nationality: '',
    resident_status: '',
    sex: 'Male',
    date_of_birth: '',
    height: '',
    weight: '',
    has_tool_box: false,
    username_handle: '',
    location: '',
    phone: '',
  });

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/'); return; }

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          setExistingUsername(data.username || null);
          setForm({
            name: [data.first_name, data.last_name].filter(Boolean).join(' ') || '',
            designation: data.designation || '',
            nationality: data.citizenship || '',
            resident_status: data.residency_status || '',
            sex: data.sex || 'Male',
            date_of_birth: data.date_of_birth || '',
            height: data.height?.toString() || '',
            weight: data.weight?.toString() || '',
            has_tool_box: data.has_tool_box || false,
            username_handle: data.username_handle || '',
            location: data.location || '',
            phone: data.phone || '',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchExisting();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }

      const firstName = form.name.split(' ')[0] || form.name;
      const handle = form.username_handle || firstName.toLowerCase().replace(/[^a-z0-9]/g, '');

      let username = existingUsername;
      if (!username) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const uniqueCode = Array.from({length: 4}, () => chars[Math.floor(Math.random() * 36)]).join('');
        username = `${uniqueCode}-${handle}`;
      } else {
        const code = username.split('-')[0];
        username = `${code}-${handle}`;
      }

      const { error: insertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: firstName,
          last_name: form.name.split(' ').slice(1).join(' ') || '',
          designation: form.designation,
          citizenship: form.nationality,
          residency_status: form.resident_status,
          sex: form.sex,
          date_of_birth: form.date_of_birth || null,
          height: form.height ? Number(form.height) : null,
          weight: form.weight ? Number(form.weight) : null,
          has_tool_box: form.has_tool_box,
          username: username,
          username_handle: handle,
          location: form.location || null,
          phone: form.phone || null,
          updated_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;
      navigate('/cv');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "block w-full rounded-md bg-gray-700 border border-gray-600 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1";

  if (isFetching) return (
    <div className="min-h-64 flex items-center justify-center">
      <div className="text-blue-400">Loading your profile...</div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 shadow-xl rounded-lg border border-gray-700 p-8">
      <h1 className="text-2xl font-bold text-white mb-2">{existingUsername ? 'Edit your profile' : 'Create your AECircle profile'}</h1>
      <p className="text-gray-400 mb-8">Your profile URL: <span className="text-blue-400">aircraft.engineer/cv/{existingUsername || '????-you'}</span></p>

      {error && (
        <div className="mb-6 p-3 rounded bg-red-500/10 border border-red-500 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>Full name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="e.g. Samuel Hayden" />
        </div>

        <div>
          <label className={labelClass}>Designation</label>
          <input type="text" name="designation" value={form.designation} onChange={handleChange} required className={inputClass} placeholder="e.g. Aircraft Maintenance Engineer" />
        </div>

        <div>
          <label className={labelClass}>Profile handle <span className="text-gray-500 text-xs">(the part after your code in your URL)</span></label>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">{existingUsername ? existingUsername.split('-')[0] : '????'}-</span>
            <input type="text" name="username_handle" value={form.username_handle} onChange={handleChange} className={inputClass} placeholder="yourname" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nationality</label>
            <input type="text" name="nationality" value={form.nationality} onChange={handleChange} className={inputClass} placeholder="e.g. British" maxLength={30} />
          </div>
          <div>
            <label className={labelClass}>Resident status</label>
            <input type="text" name="resident_status" value={form.resident_status} onChange={handleChange} className={inputClass} placeholder="e.g. UAE Resident" maxLength={30} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Sex</label>
            <select name="sex" value={form.sex} onChange={handleChange} className={inputClass}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Date of birth</label>
            <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Height (cm)</label>
            <input type="number" name="height" value={form.height} onChange={handleChange} className={inputClass} placeholder="175" />
          </div>
          <div>
            <label className={labelClass}>Weight (kg)</label>
            <input type="number" name="weight" value={form.weight} onChange={handleChange} className={inputClass} placeholder="80" />
          </div>
        </div>
<div>
          <label className={labelClass}>Location <span className="text-gray-500 text-xs">(max 20 chars — e.g. London, UK)</span></label>
          <input type="text" name="location" value={form.location} onChange={handleChange} className={inputClass} placeholder="e.g. London, UK" maxLength={20} />
          <p className="text-xs text-gray-600 mt-1">{form.location?.length || 0}/20</p>
        </div>
        <div>
          <label className={labelClass}>Phone number</label>
          <input type="text" name="phone" value={form.phone || ''} onChange={handleChange} className={inputClass} placeholder="e.g. +971 50 123 4567" />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" name="has_tool_box" id="toolbox" checked={form.has_tool_box} onChange={handleChange} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" />
          <label htmlFor="toolbox" className="text-gray-300 text-sm">I have my own toolbox</label>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-md font-medium transition-colors">
            {isLoading ? 'Saving...' : existingUsername ? 'Save changes' : 'Create my profile'}
          </button>
          <button type="button" onClick={() => navigate('/cv')} className="px-6 py-3 border border-gray-600 text-gray-300 hover:text-white rounded-md transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProfile;
