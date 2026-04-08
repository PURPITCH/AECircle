import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AVAILABILITY = ['Actively looking', 'Open to offers', 'Not looking'];
const NOTICE_PERIODS = ['Immediate', '2 weeks', '1 month', '2 months', '3 months', '6 months'];

interface AdditionalInfoData {
  availability: string;
  notice_period: string;
  willing_to_relocate: boolean;
  preferred_locations: string;
}

const empty = (): AdditionalInfoData => ({
  availability: '',
  notice_period: '',
  willing_to_relocate: false,
  preferred_locations: '',
});

const inputClass = "block w-full rounded-md bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-xs font-medium text-gray-400 mb-1";

export const AdditionalInfo: React.FC = () => {
  const [form, setForm] = useState(empty());
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('availability, notice_period, willing_to_relocate, preferred_locations').eq('id', user.id).maybeSingle();
    if (data) {
      setForm({
        availability: data.availability || '',
        notice_period: data.notice_period || '',
        willing_to_relocate: data.willing_to_relocate || false,
        preferred_locations: data.preferred_locations || '',
      });
      setHasData(!!(data.availability || data.notice_period));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('profiles').update({ ...form, updated_at: new Date().toISOString() }).eq('id', user.id);
      setHasData(true);
      setIsEditing(false);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally { setSaving(false); }
  };

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="mt-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-blue-400">Additional Information</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)}
            className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
            {hasData ? 'Edit' : '+ Add'}
          </button>
        )}
      </div>

      {/* Display view */}
      {!isEditing && hasData && (
        <div className="space-y-2 text-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {form.availability && (
              <span className="flex items-center gap-1.5">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  form.availability === 'Actively looking' ? 'bg-green-500/20 text-green-400' :
                  form.availability === 'Open to offers' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'}`}>
                  {form.availability}
                </span>
              </span>
            )}
            {form.notice_period && (
              <span className="flex items-center gap-1.5">
                <span className="text-gray-500">Notice</span>
                <span className="text-gray-300">{form.notice_period}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="text-gray-500">Relocation</span>
              <span className="text-gray-300">{form.willing_to_relocate ? 'Yes' : 'No'}</span>
            </span>
          </div>
          {form.willing_to_relocate && form.preferred_locations && (
            <div className="flex items-start gap-2">
              <span className="text-gray-500">Preferred locations</span>
              <span className="text-gray-300">{form.preferred_locations}</span>
            </div>
          )}
        </div>
      )}
 

      {/* Edit form */}
      {isEditing && (
        <div className="border border-blue-500/30 rounded-lg p-5 bg-gray-800/50 space-y-3">
          <div>
            <label className={labelClass}>Job search status</label>
            <select className={inputClass} value={form.availability} onChange={e => set('availability', e.target.value)}>
              <option value="">Select status</option>
              {AVAILABILITY.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Notice period</label>
            <select className={inputClass} value={form.notice_period} onChange={e => set('notice_period', e.target.value)}>
              <option value="">Select notice period</option>
              {NOTICE_PERIODS.map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="relocate" checked={form.willing_to_relocate} onChange={e => set('willing_to_relocate', e.target.checked)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" />
            <label htmlFor="relocate" className="text-gray-300 text-sm">Willing to relocate</label>
          </div>
          {form.willing_to_relocate && (
            <div>
              <label className={labelClass}>Preferred locations</label>
              <input className={inputClass} placeholder="e.g. Dubai, UK, Singapore" value={form.preferred_locations} onChange={e => set('preferred_locations', e.target.value)} />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionalInfo;
