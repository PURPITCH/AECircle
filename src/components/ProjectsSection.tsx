import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  organisation: string;
  start_date: string;
  end_date: string;
  is_ongoing: boolean;
  brief: string;
}

const empty = (): Omit<Project, 'id'> => ({
  title: '', organisation: '', start_date: '', end_date: '', is_ongoing: false, brief: '',
});

const inputClass = "block w-full rounded-md bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-xs font-medium text-gray-400 mb-1";

export const ProjectsSection: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('projects').select('*').eq('user_id', user.id).order('start_date', { ascending: false });
    if (data) setProjects(data);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const payload = {
        ...form,
        start_date: form.start_date || null,
        end_date: form.is_ongoing ? null : (form.end_date || null),
      };
      if (editingId) {
        await supabase.from('projects').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editingId);
      } else {
        await supabase.from('projects').insert({ ...payload, user_id: user.id });
      }
      await fetchProjects();
      setIsAdding(false);
      setEditingId(null);
      setForm(empty());
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    await supabase.from('projects').delete().eq('id', id);
    await fetchProjects();
  };

  const handleEdit = (p: Project) => {
    setForm({ title: p.title, organisation: p.organisation || '', start_date: p.start_date || '', end_date: p.end_date || '', is_ongoing: p.is_ongoing, brief: p.brief || '' });
    setEditingId(p.id);
    setIsAdding(true);
  };

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '';

  return (
    <div className="mt-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-blue-400">Projects</h2>
        {!isAdding && (
          <button onClick={() => { setIsAdding(true); setEditingId(null); setForm(empty()); }}
            className="flex items-center gap-1 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
            <Plus className="w-4 h-4" /> Add
          </button>
        )}
      </div>

      {projects.map(p => (
        <div key={p.id} className="mb-3 border border-gray-600 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-700 cursor-pointer"
            onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white text-sm">{p.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {p.organisation && `${p.organisation} · `}
                {formatDate(p.start_date)} — {p.is_ongoing ? 'Ongoing' : formatDate(p.end_date)}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <button onClick={e => { e.stopPropagation(); handleEdit(p); }} className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1">Edit</button>
              <button onClick={e => { e.stopPropagation(); handleDelete(p.id); }} className="text-xs text-red-400 hover:text-red-300 px-2 py-1">Delete</button>
              {expandedId === p.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </div>
          {expandedId === p.id && p.brief && (
            <div className="px-4 py-3 text-sm text-gray-400">{p.brief}</div>
          )}
        </div>
      ))}

      {projects.length === 0 && !isAdding && (
        <p className="text-gray-500 text-sm">No projects added yet</p>
      )}

      {isAdding && (
        <div className="border border-blue-500/30 rounded-lg p-5 bg-gray-800/50 space-y-3">
          <h3 className="text-sm font-medium text-blue-400">{editingId ? 'Edit project' : 'Add project'}</h3>
          <div>
            <label className={labelClass}>Project / Initiative title</label>
            <input className={inputClass} placeholder="e.g. EASA Part 145 MOE Development" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Organisation / Company</label>
            <input className={inputClass} placeholder="e.g. My Airlines" value={form.organisation} onChange={e => set('organisation', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Start date</label>
              <input type="date" className={inputClass} value={form.start_date} onChange={e => set('start_date', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>End date</label>
              <input type="date" className={inputClass} value={form.end_date} onChange={e => set('end_date', e.target.value)} disabled={form.is_ongoing} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ongoing" checked={form.is_ongoing} onChange={e => set('is_ongoing', e.target.checked)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" />
            <label htmlFor="ongoing" className="text-gray-300 text-sm">This is ongoing</label>
          </div>
          <div>
            <label className={labelClass}>Brief description <span className="text-gray-600">(optional)</span></label>
            <textarea className={inputClass} rows={3} placeholder="What did you do, what was the outcome..." value={form.brief} onChange={e => set('brief', e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
            </button>
            <button onClick={() => { setIsAdding(false); setEditingId(null); setForm(empty()); }}
              className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;
