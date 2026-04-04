import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, ChevronDown, ChevronUp, Award } from 'lucide-react';

interface TypeRating {
  aircraft_type: string;
  engine_type: string;
  endorsed_date: string;
  certified_tasks: number;
  verified: boolean;
}

interface License {
  id: string;
  license_type: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
  type_ratings: TypeRating[];
}

const emptyRating = (): TypeRating => ({
  aircraft_type: '',
  engine_type: '',
  endorsed_date: '',
  certified_tasks: 0,
  verified: false,
});

const emptyLicense = (): Omit<License, 'id'> => ({
  license_type: '',
  issuing_authority: '',
  issue_date: '',
  expiry_date: '',
  type_ratings: [emptyRating()],
});

const inputClass = "block w-full rounded-md bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-xs font-medium text-gray-400 mb-1";

export const LicenseSection: React.FC = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyLicense());
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { fetchLicenses(); }, []);

  const fetchLicenses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('licenses').select('*').eq('user_id', user.id).order('created_at');
    if (data) setLicenses(data);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingId) {
        await supabase.from('licenses').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editingId);
      } else {
        await supabase.from('licenses').insert({ ...form, user_id: user.id });
      }
      await fetchLicenses();
      setIsAdding(false);
      setEditingId(null);
      setForm(emptyLicense());
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('licenses').delete().eq('id', id);
    await fetchLicenses();
  };

  const handleEdit = (license: License) => {
    setForm({ license_type: license.license_type, issuing_authority: license.issuing_authority, issue_date: license.issue_date, expiry_date: license.expiry_date, type_ratings: license.type_ratings });
    setEditingId(license.id);
    setIsAdding(true);
  };

  const updateRating = (index: number, field: keyof TypeRating, value: string | number) => {
    const updated = [...form.type_ratings];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, type_ratings: updated });
  };

  const addRating = () => setForm({ ...form, type_ratings: [...form.type_ratings, emptyRating()] });
  const removeRating = (i: number) => setForm({ ...form, type_ratings: form.type_ratings.filter((_, idx) => idx !== i) });

  const isExpired = (date: string) => date && new Date(date) < new Date();

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-400">
  Licenses & Endorsements
        </h2>
        {!isAdding && (
          <button onClick={() => { setIsAdding(true); setEditingId(null); setForm(emptyLicense()); }}
            className="flex items-center gap-1 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
            <Plus className="w-4 h-4" /> Add license
          </button>
        )}
      </div>

      {/* License display cards */}
      {licenses.map(license => (
        <div key={license.id} className="mb-4 bg-gray-750 border border-gray-600 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-700 cursor-pointer"
            onClick={() => setExpandedId(expandedId === license.id ? null : license.id)}>
            <div>
              <span className="font-medium text-white text-sm">{license.license_type}</span>
              <span className="text-gray-400 text-sm"> — {license.issuing_authority}</span>
              {license.expiry_date && (
                <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${isExpired(license.expiry_date) ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                  {isExpired(license.expiry_date) ? 'Expired' : `Valid until ${new Date(license.expiry_date).toLocaleDateString('en-GB')}`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); handleEdit(license); }} className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1">Edit</button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(license.id); }} className="text-xs text-red-400 hover:text-red-300 px-2 py-1">Delete</button>
              {expandedId === license.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </div>

          {expandedId === license.id && (
            <div className="px-4 py-3">
              <div className="text-xs text-gray-500 mb-3">
                {license.issue_date && `Issued: ${new Date(license.issue_date).toLocaleDateString('en-GB')}`}
                {license.issue_date && license.expiry_date && '   '}
                {license.expiry_date && `Expires: ${new Date(license.expiry_date).toLocaleDateString('en-GB')}`}
              </div>
              {license.type_ratings?.map((rating, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-t border-gray-700 text-sm">
                  <span className="text-gray-500">├──</span>
                  <span className="text-white font-medium">{rating.aircraft_type}</span>
                  {rating.engine_type && <span className="text-gray-400">/ {rating.engine_type}</span>}
                  {rating.endorsed_date && <span className="text-gray-500 text-xs">{new Date(rating.endorsed_date).toLocaleDateString('en-GB')}</span>}
                  {rating.certified_tasks > 0 && <span className="text-gray-400 text-xs">{rating.certified_tasks} certified tasks</span>}
                  {rating.verified && <span className="text-green-400 font-bold">✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Add/Edit form */}
      {isAdding && (
        <div className="border border-blue-500/30 rounded-lg p-5 bg-gray-800/50">
          <h3 className="text-sm font-medium text-blue-400 mb-4">{editingId ? 'Edit license' : 'Add new license'}</h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className={labelClass}>License type</label>
              <input className={inputClass} placeholder="e.g. EASA Part 66 B1.1" value={form.license_type}
                onChange={e => setForm({ ...form, license_type: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Issuing authority</label>
              <input className={inputClass} placeholder="e.g. GCAA UAE" value={form.issuing_authority}
                onChange={e => setForm({ ...form, issuing_authority: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Issue date</label>
              <input type="date" className={inputClass} value={form.issue_date}
                onChange={e => setForm({ ...form, issue_date: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Expiry date</label>
              <input type="date" className={inputClass} value={form.expiry_date}
                onChange={e => setForm({ ...form, expiry_date: e.target.value })} />
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-400">Type ratings</label>
              <button onClick={addRating} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add rating
              </button>
            </div>
            {form.type_ratings.map((rating, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2 items-end">
                <div>
                  <label className={labelClass}>Aircraft type</label>
                  <input className={inputClass} placeholder="B737-800" value={rating.aircraft_type}
                    onChange={e => updateRating(i, 'aircraft_type', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Engine type</label>
                  <input className={inputClass} placeholder="CFM56-7B" value={rating.engine_type}
                    onChange={e => updateRating(i, 'engine_type', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Endorsed date</label>
                  <input type="date" className={inputClass} value={rating.endorsed_date}
                    onChange={e => updateRating(i, 'endorsed_date', e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className={labelClass}>Certified tasks</label>
                    <input type="number" className={inputClass} placeholder="0" value={rating.certified_tasks}
                      onChange={e => updateRating(i, 'certified_tasks', parseInt(e.target.value) || 0)} />
                  </div>
                  {form.type_ratings.length > 1 && (
                    <button onClick={() => removeRating(i)} className="mt-5 text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
              {saving ? 'Saving...' : editingId ? 'Update license' : 'Save license'}
            </button>
            <button onClick={() => { setIsAdding(false); setEditingId(null); setForm(emptyLicense()); }}
              className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {licenses.length === 0 && !isAdding && (
        <p className="text-gray-500 text-sm">No licenses added yet</p>
      )}
    </div>
  );
};

export default LicenseSection;
