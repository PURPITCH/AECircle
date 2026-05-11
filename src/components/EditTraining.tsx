import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, ChevronLeft, Eye, EyeOff } from 'lucide-react';

const COURSE_TYPES = ['Type Rating', 'Initial Training', 'Continuation Training', 'Recurrency', 'Academic', 'OJT', 'SOJT', 'Other'];
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

export const EditTraining: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showPrice, setShowPrice] = useState(false);
  const [form, setForm] = useState({
    title: '', course_types: [] as string[], aircraft_type: '',
    engine_type: '', component: '', level: '', approval: '',
    delivery: '', location_theory: '', location_practical: '',
    visa_access: '', duration: '', price: '', start_date: '',
    end_date: '', is_ongoing: false, max_students: '', description: '',
    apply_inhouse: true, apply_external_link: '', apply_email: '',
  });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('training_posts').select('*').eq('id', id).maybeSingle();
      if (!data) { navigate('/co/trainings'); return; }
      setShowPrice(data.show_price || false);
      setForm({
        title: data.title || '', course_types: data.course_types || [],
        aircraft_type: data.aircraft_type || '', engine_type: data.engine_type || '',
        component: data.component || '', level: data.level || '',
        approval: data.approval || '', delivery: data.delivery || '',
        location_theory: data.location_theory || '', location_practical: data.location_practical || '',
        visa_access: data.visa_access || '', duration: data.duration || '',
        price: data.price || '', start_date: data.start_date || '',
        end_date: data.end_date || '', is_ongoing: data.is_ongoing || false,
        max_students: data.max_students?.toString() || '', description: data.description || '',
        apply_inhouse: data.apply_inhouse ?? true, apply_external_link: data.apply_external_link || '',
        apply_email: data.apply_email || '',
      });
      setIsFetching(false);
    };
    fetch();
  }, [id]);

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.from('training_posts').update({
        title: form.title, course_types: form.course_types,
        aircraft_type: form.aircraft_type || null, engine_type: form.engine_type || null,
        component: form.component || null, level: form.level || null,
        approval: form.approval || null, delivery: form.delivery || null,
        location_theory: form.location_theory || null, location_practical: form.location_practical || null,
        visa_access: form.visa_access || null, duration: form.duration || null,
        price: showPrice ? form.price : null, show_price: showPrice,
        start_date: form.start_date || null,
        end_date: form.is_ongoing ? null : form.end_date || null,
        is_ongoing: form.is_ongoing,
        max_students: form.max_students ? parseInt(form.max_students) : null,
        description: form.description || null, apply_inhouse: form.apply_inhouse,
        apply_external_link: form.apply_external_link || null,
        apply_email: form.apply_email || null,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw error;
      navigate('/co/trainings');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally { setIsLoading(false); }
  };

  if (isFetching) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/co/trainings')} className="text-gray-400 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="text-2xl font-bold text-white">Edit training listing</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Course Details</h2>
            <div><label className={labelClass}>Course title *</label><input required className={inputClass} value={form.title} onChange={e => set('title', e.target.value)} /></div>
            <div><label className={labelClass}>Course type</label><CheckboxGroup options={COURSE_TYPES} selected={form.course_types} onChange={v => set('course_types', v)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Aircraft type</label><input className={inputClass} value={form.aircraft_type} onChange={e => set('aircraft_type', e.target.value)} /></div>
              <div><label className={labelClass}>Engine type</label><input className={inputClass} value={form.engine_type} onChange={e => set('engine_type', e.target.value)} /></div>
            </div>
            <div><label className={labelClass}>Component</label><input className={inputClass} value={form.component} onChange={e => set('component', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Level</label><input className={inputClass} value={form.level} onChange={e => set('level', e.target.value)} /></div>
              <div><label className={labelClass}>Approval</label><input className={inputClass} value={form.approval} onChange={e => set('approval', e.target.value)} /></div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Delivery & Location</h2>
            <div><label className={labelClass}>Delivery method</label><input className={inputClass} value={form.delivery} onChange={e => set('delivery', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Theory location</label><input className={inputClass} value={form.location_theory} onChange={e => set('location_theory', e.target.value)} /></div>
              <div><label className={labelClass}>Practical location</label><input className={inputClass} value={form.location_practical} onChange={e => set('location_practical', e.target.value)} /></div>
            </div>
            <div><label className={labelClass}>Visa & Access</label><input className={inputClass} value={form.visa_access} onChange={e => set('visa_access', e.target.value)} /></div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Schedule & Price</h2>
            <div><label className={labelClass}>Duration</label><input className={inputClass} value={form.duration} onChange={e => set('duration', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Start date</label><input type="date" className={inputClass} value={form.start_date} onChange={e => set('start_date', e.target.value)} /></div>
              <div><label className={labelClass}>End date</label><input type="date" className={inputClass} value={form.end_date} onChange={e => set('end_date', e.target.value)} disabled={form.is_ongoing} /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_ongoing} onChange={e => set('is_ongoing', e.target.checked)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" />
              <label className="text-gray-300 text-sm">Ongoing / Multiple dates available</label>
            </div>
            <div><label className={labelClass}>Max students</label><input type="number" min="1" className={inputClass} value={form.max_students} onChange={e => set('max_students', e.target.value)} /></div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass}>Price</label>
                <button type="button" onClick={() => setShowPrice(!showPrice)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white">
                  {showPrice ? <><Eye className="w-3 h-3" /> Visible</> : <><EyeOff className="w-3 h-3" /> Hidden</>}
                </button>
              </div>
              {showPrice && <input className={inputClass} value={form.price} onChange={e => set('price', e.target.value)} />}
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Description</h2>
            <div>
              <label className={labelClass}>Description <span className="text-gray-500 text-xs">(max 1500)</span></label>
              <textarea className={inputClass} rows={6} value={form.description} onChange={e => set('description', e.target.value)} maxLength={1500} />
              <p className="text-xs text-gray-600 mt-1">{form.description.length}/1500</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Booking Method</h2>
            <div className="flex items-center gap-3"><input type="checkbox" checked={form.apply_inhouse} onChange={e => set('apply_inhouse', e.target.checked)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" /><label className="text-gray-300 text-sm">Book via AECircle</label></div>
            <div><label className={labelClass}>External booking link</label><input className={inputClass} value={form.apply_external_link} onChange={e => set('apply_external_link', e.target.value)} /></div>
            <div><label className={labelClass}>Email</label><input type="email" className={inputClass} value={form.apply_email} onChange={e => set('apply_email', e.target.value)} /></div>
          </div>
          <div className="flex gap-3 pb-8">
            <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Saving...</> : 'Save changes'}
            </button>
            <button type="button" onClick={() => navigate('/co/trainings')} className="px-6 py-3 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTraining;
