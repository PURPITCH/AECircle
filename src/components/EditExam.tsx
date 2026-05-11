import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, ChevronLeft, Eye, EyeOff, Plus, X } from 'lucide-react';

const CATEGORIES = ['A','B1.1','B1.2','B1.3','B1.4','B2','B2L','B3','L1C','L1','L2C','L2','L3H','L3G','L4H','L4G','L5'];

const inputClass = "block w-full rounded-md bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-gray-300 mb-1";

const CheckboxGroup: React.FC<{ options: string[]; selected: string[]; onChange: (val: string[]) => void }> = ({ options, selected, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => (
      <button key={opt} type="button"
        onClick={() => onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selected.includes(opt) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white border border-gray-600'}`}>
        {opt}
      </button>
    ))}
  </div>
);

interface TimetableRow { date: string; time: string; module: string; }

export const EditExam: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showPrice, setShowPrice] = useState(false);
  const [timetable, setTimetable] = useState<TimetableRow[]>([{ date: '', time: '', module: '' }]);
  const [form, setForm] = useState({
    title: '', categories: [] as string[], modules: '',
    affiliated_part147: '', authority_approval: '', location: '',
    location_map_link: '', visa_access: '', price: '', max_students: '',
    description: '', apply_inhouse: true, apply_external_link: '',
    apply_email: '', apply_phone: '',
  });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('exam_posts').select('*').eq('id', id).maybeSingle();
      if (!data) { navigate('/co/exams'); return; }
      setShowPrice(data.show_price || false);
      setForm({
        title: data.title || '',
        categories: data.categories || [],
        modules: data.modules || '',
        affiliated_part147: data.affiliated_part147 || '',
        authority_approval: data.authority_approval || '',
        location: data.location || '',
        location_map_link: data.location_map_link || '',
        visa_access: data.visa_access || '',
        price: data.price || '',
        max_students: data.max_students?.toString() || '',
        description: data.description || '',
        apply_inhouse: data.apply_inhouse ?? true,
        apply_external_link: data.apply_external_link || '',
        apply_email: data.apply_email || '',
        apply_phone: data.apply_phone || '',
      });
      setTimetable(data.timetable?.length > 0 ? data.timetable : [{ date: '', time: '', module: '' }]);
      setIsFetching(false);
    };
    fetch();
  }, [id]);

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const addRow = () => setTimetable(prev => [...prev, { date: '', time: '', module: '' }]);
  const updateRow = (i: number, field: keyof TimetableRow, val: string) =>
    setTimetable(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  const removeRow = (i: number) => setTimetable(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const validTimetable = timetable.filter(r => r.date || r.time || r.module);
      const { error } = await supabase.from('exam_posts').update({
        title: form.title,
        categories: form.categories,
        modules: form.modules || null,
        affiliated_part147: form.affiliated_part147 || null,
        authority_approval: form.authority_approval || null,
        location: form.location || null,
        location_map_link: form.location_map_link || null,
        visa_access: form.visa_access || null,
        timetable: validTimetable.length > 0 ? validTimetable : null,
        price: showPrice ? form.price : null,
        show_price: showPrice,
        max_students: form.max_students ? parseInt(form.max_students) : null,
        description: form.description || null,
        apply_inhouse: form.apply_inhouse,
        apply_external_link: form.apply_external_link || null,
        apply_email: form.apply_email || null,
        apply_phone: form.apply_phone || null,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw error;
      navigate('/co/exams');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally { setIsLoading(false); }
  };

  if (isFetching) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/co/exams')} className="text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Edit exam listing</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Exam Details</h2>
            <div><label className={labelClass}>Exam title *</label><input required className={inputClass} value={form.title} onChange={e => set('title', e.target.value)} /></div>
            <div><label className={labelClass}>Category</label><CheckboxGroup options={CATEGORIES} selected={form.categories} onChange={v => set('categories', v)} /></div>
            <div><label className={labelClass}>Modules</label><input className={inputClass} placeholder="e.g. All / 1 2 3 4 5" value={form.modules} onChange={e => set('modules', e.target.value)} /></div>
            <div><label className={labelClass}>Affiliated Part 147 organisation</label><input className={inputClass} value={form.affiliated_part147} onChange={e => set('affiliated_part147', e.target.value)} /></div>
            <div><label className={labelClass}>Authority approval</label><input className={inputClass} value={form.authority_approval} onChange={e => set('authority_approval', e.target.value)} /></div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Location</h2>
            <div><label className={labelClass}>Location</label><input className={inputClass} value={form.location} onChange={e => set('location', e.target.value)} /></div>
            <div><label className={labelClass}>Google Maps link</label><input className={inputClass} placeholder="https://maps.google.com/..." value={form.location_map_link} onChange={e => set('location_map_link', e.target.value)} /></div>
            <div><label className={labelClass}>Visa & Access</label><input className={inputClass} value={form.visa_access} onChange={e => set('visa_access', e.target.value)} /></div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Timetable</h2>
              <button type="button" onClick={addRow} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"><Plus className="w-3 h-3" /> Add session</button>
            </div>
            {timetable.map((row, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4"><input type="date" className={inputClass} value={row.date} onChange={e => updateRow(i, 'date', e.target.value)} /></div>
                <div className="col-span-2"><input type="time" className={inputClass} value={row.time} onChange={e => updateRow(i, 'time', e.target.value)} /></div>
                <div className="col-span-5"><input className={inputClass} placeholder="Module / subject" value={row.module} onChange={e => updateRow(i, 'module', e.target.value)} /></div>
                <div className="col-span-1 flex justify-center">
                  {timetable.length > 1 && <button type="button" onClick={() => removeRow(i)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Price & Capacity</h2>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass}>Price</label>
                <button type="button" onClick={() => setShowPrice(!showPrice)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white">
                  {showPrice ? <><Eye className="w-3 h-3" /> Visible</> : <><EyeOff className="w-3 h-3" /> Hidden</>}
                </button>
              </div>
              {showPrice && <input className={inputClass} value={form.price} onChange={e => set('price', e.target.value)} />}
            </div>
            <div><label className={labelClass}>Max students</label><input type="number" min="1" className={inputClass} value={form.max_students} onChange={e => set('max_students', e.target.value)} /></div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Description</h2>
            <div>
              <label className={labelClass}>Description <span className="text-gray-500 text-xs">(max 1000)</span></label>
              <textarea className={inputClass} rows={5} value={form.description} onChange={e => set('description', e.target.value)} maxLength={1000} />
              <p className="text-xs text-gray-600 mt-1">{form.description.length}/1000</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Contact & Booking</h2>
            <div className="flex items-center gap-3"><input type="checkbox" checked={form.apply_inhouse} onChange={e => set('apply_inhouse', e.target.checked)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" /><label className="text-gray-300 text-sm">Book via AECircle</label></div>
            <div><label className={labelClass}>External link</label><input className={inputClass} value={form.apply_external_link} onChange={e => set('apply_external_link', e.target.value)} /></div>
            <div><label className={labelClass}>Email</label><input type="email" className={inputClass} value={form.apply_email} onChange={e => set('apply_email', e.target.value)} /></div>
            <div><label className={labelClass}>Phone / WhatsApp</label><input className={inputClass} value={form.apply_phone} onChange={e => set('apply_phone', e.target.value)} /></div>
          </div>

          <div className="flex gap-3 pb-8">
            <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Saving...</> : 'Save changes'}
            </button>
            <button type="button" onClick={() => navigate('/co/exams')} className="px-6 py-3 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExam;
