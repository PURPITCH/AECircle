import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export const PostExam: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [showPrice, setShowPrice] = useState(false);
  const [timetable, setTimetable] = useState<TimetableRow[]>([{ date: '', time: '', module: '' }]);
  const [form, setForm] = useState({
    title: '',
    categories: [] as string[],
    modules: '',
    affiliated_part147: '',
    authority_approval: '',
    location: '',
    location_map_link: '',
    visa_access: '',
    price: '',
    max_students: '',
    description: '',
    apply_inhouse: true,
    apply_external_link: '',
    apply_email: '',
    apply_phone: '',
  });

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/co'); return; }
      const { data } = await supabase.from('company_profiles').select('id').eq('user_id', user.id).maybeSingle();
      if (!data) { navigate('/co/register'); return; }
      setCompanyId(data.id);
    };
    fetch();
  }, []);

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const p1 = Array.from({length: 4}, () => chars[Math.floor(Math.random() * 36)]).join('');
    const p2 = Array.from({length: 4}, () => chars[Math.floor(Math.random() * 36)]).join('');
    return `${p1}-${p2}`;
  };

  const addRow = () => setTimetable(prev => [...prev, { date: '', time: '', module: '' }]);
  const updateRow = (i: number, field: keyof TimetableRow, val: string) =>
    setTimetable(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  const removeRow = (i: number) => setTimetable(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const exam_code = generateCode();
      const validTimetable = timetable.filter(r => r.date || r.time || r.module);
      const { error } = await supabase.from('exam_posts').insert({
        company_id: companyId,
        user_id: user.id,
        exam_code,
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
        is_active: true,
        is_premium: false,
      });
      if (error) throw error;
      navigate('/co/exams');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/co/exams')} className="text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Post an exam</h1>
            <p className="text-gray-500 text-xs mt-0.5">Your listing will be reviewed before going live</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Exam basics */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Exam Details</h2>
            <div>
              <label className={labelClass}>Exam title *</label>
              <input required className={inputClass} placeholder="e.g. EASA Part 66 B1.1 Written Examination" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <CheckboxGroup options={CATEGORIES} selected={form.categories} onChange={v => set('categories', v)} />
            </div>
            <div>
              <label className={labelClass}>Modules <span className="text-gray-500 text-xs">(free text)</span></label>
              <input className={inputClass} placeholder="e.g. All / 1 2 3 4 5 6 7 8 / Module 11A only" value={form.modules} onChange={e => set('modules', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Affiliated Part 147 organisation <span className="text-gray-500 text-xs">(if conducting on behalf of)</span></label>
              <input className={inputClass} placeholder="e.g. Lufthansa Technical Training GmbH" value={form.affiliated_part147} onChange={e => set('affiliated_part147', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Authority approval</label>
              <input className={inputClass} placeholder="e.g. EASA, HCAA Greece, CAA-UK, GCAA UAE" value={form.authority_approval} onChange={e => set('authority_approval', e.target.value)} />
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Location</h2>
            <div>
              <label className={labelClass}>Exam location</label>
              <input className={inputClass} placeholder="e.g. Athens, Greece / Online / Dubai, UAE" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Google Maps link <span className="text-gray-500 text-xs">(optional)</span></label>
              <input className={inputClass} placeholder="https://maps.google.com/..." value={form.location_map_link} onChange={e => set('location_map_link', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Visa & Access requirements</label>
              <input className={inputClass} placeholder="e.g. Schengen visa required, open to all nationalities..." value={form.visa_access} onChange={e => set('visa_access', e.target.value)} />
            </div>
          </div>

          {/* Timetable */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Timetable</h2>
              <button type="button" onClick={addRow}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                <Plus className="w-3 h-3" /> Add session
              </button>
            </div>
            <div className="space-y-2">
              {timetable.map((row, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <input type="date" className={inputClass} value={row.date} onChange={e => updateRow(i, 'date', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input type="time" className={inputClass} value={row.time} onChange={e => updateRow(i, 'time', e.target.value)} />
                  </div>
                  <div className="col-span-5">
                    <input className={inputClass} placeholder="Module / subject" value={row.module} onChange={e => updateRow(i, 'module', e.target.value)} />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {timetable.length > 1 && (
                      <button type="button" onClick={() => removeRow(i)} className="text-red-400 hover:text-red-300">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600">Date · Time · Module/Subject for each session</p>
          </div>

          {/* Price & Capacity */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Price & Capacity</h2>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass}>Price</label>
                <button type="button" onClick={() => setShowPrice(!showPrice)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                  {showPrice ? <><Eye className="w-3 h-3" /> Visible</> : <><EyeOff className="w-3 h-3" /> Hidden</>}
                </button>
              </div>
              {showPrice
                ? <input className={inputClass} placeholder="e.g. EUR 150 per module / EUR 1,200 full exam" value={form.price} onChange={e => set('price', e.target.value)} />
                : <p className="text-xs text-gray-500">Price will not be shown — contact for details</p>
              }
            </div>
            <div>
              <label className={labelClass}>Max students <span className="text-gray-500 text-xs">(optional)</span></label>
              <input type="number" min="1" className={inputClass} placeholder="e.g. 20" value={form.max_students} onChange={e => set('max_students', e.target.value)} />
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Description</h2>
            <div>
              <label className={labelClass}>Description <span className="text-gray-500 text-xs">(max 1000 chars)</span></label>
              <textarea className={inputClass} rows={5} placeholder="Prerequisites, what's included, exam format, pass rate..." value={form.description} onChange={e => set('description', e.target.value)} maxLength={1000} />
              <p className="text-xs text-gray-600 mt-1">{form.description.length}/1000</p>
            </div>
          </div>

          {/* Contact & Booking */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Contact & Booking</h2>
            <p className="text-xs text-gray-500">Select one or more</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="inhouse" checked={form.apply_inhouse} onChange={e => set('apply_inhouse', e.target.checked)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500" />
                <label htmlFor="inhouse" className="text-gray-300 text-sm">Book via AECircle <span className="text-blue-400 text-xs">— Recommended</span></label>
              </div>
              <div>
                <label className={labelClass}>External booking link</label>
                <input className={inputClass} placeholder="https://yourcompany.com/register" value={form.apply_external_link} onChange={e => set('apply_external_link', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" className={inputClass} placeholder="exams@yourorganisation.com" value={form.apply_email} onChange={e => set('apply_email', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Phone / WhatsApp</label>
                <input className={inputClass} placeholder="e.g. +30 210 123 4567" value={form.apply_phone} onChange={e => set('apply_phone', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Payment notice */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-sm text-blue-300">
            <p className="font-medium mb-1">💳 Payment — $99 per exam listing</p>
            <p className="text-xs text-blue-400">Your listing will be reviewed and activated within 24 hours. We will contact you at your registered email to complete payment.</p>
          </div>

          <div className="flex gap-3 pb-8">
            <button type="submit" disabled={isLoading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Submitting...</> : 'Submit exam listing — $99'}
            </button>
            <button type="button" onClick={() => navigate('/co/exams')}
              className="px-6 py-3 border border-gray-600 text-gray-300 hover:text-white rounded-md text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostExam;
