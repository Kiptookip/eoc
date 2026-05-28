import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  CheckCircle, MapPin, PaperPlaneRight, ClipboardText,
  MagnifyingGlass, X, CaretDown,
} from '@phosphor-icons/react';
import api from '../../api/client';
import Map from '../../components/shared/Map';
import { useNotificationStore } from '../../stores/notificationStore';

const SUB_COUNTIES = [
  'Dagoretti North','Dagoretti South','Embakasi Central','Embakasi East',
  'Embakasi North','Embakasi South','Embakasi West','Kamukunji','Kasarani',
  'Kibra',"Lang'ata",'Makadara','Mathare','Roysambu','Ruaraka','Starehe','Westlands',
];

const ALERT_MODES = ['Phone', 'Radio', 'Walk-in', 'Other'];

const ORIGIN_OPTIONS = [
  'Community', 'Hospital', 'Police', 'Fire Department', 'Other EMS', 'Self-referral', 'Other',
];

const NATURE_OPTIONS = [
  'Trauma', 'Medical', 'Obstetric', 'Pediatric', 'Psychiatric', 'Burns', 'Poisoning', 'Other',
];

const NATURE_DETAIL: Record<string, string[]> = {
  Trauma: ['Road Traffic Accident', 'Fall', 'Assault/Violence', 'Industrial Accident', 'Sports Injury', 'Other'],
  Medical: ['Cardiac Arrest', 'Stroke', 'Seizure', 'Respiratory Distress', 'Diabetic Emergency', 'Other'],
  Obstetric: ['Labour', 'Post-partum Haemorrhage', 'Eclampsia', 'Miscarriage', 'Other'],
  Pediatric: ['Febrile Convulsion', 'Neonatal Emergency', 'Respiratory Distress', 'Trauma', 'Other'],
  Psychiatric: ['Attempted Suicide', 'Acute Psychosis', 'Aggression', 'Other'],
  Burns: ['Chemical', 'Electrical', 'Thermal', 'Other'],
  Poisoning: ['Drug Overdose', 'Chemical Ingestion', 'Snake Bite', 'Other'],
  Other: ['Other'],
};

type FormState = {
  alertAt: string;
  alertMode: string;
  notifierName: string;
  notifierPhone: string;
  locationName: string;
  subCounty: string;
  lat: number;
  lng: number;
  patientName: string;
  patientAge: string;
  patientGender: string;
  chiefComplaint: string;
  watcherComments: string;
  massCasualty: boolean;
  alertNature: string;
  alertNatureDetail: string;
  preHospitalManagement: string;
  originOfAlert: string;
  nextOfKin: string;
  nextOfKinPhone: string;
  placeOfReferral: string;
};

const inputCls = 'w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-teal outline-none text-slate-700 placeholder:text-slate-300 bg-white';
const labelCls = 'block text-xs font-semibold text-slate-500 mb-1';
const textareaCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-teal outline-none resize-none text-slate-700 placeholder:text-slate-300 bg-white';

// location suggestion state not currently used

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-brand-teal px-4 py-3 rounded-t-xl">
      <h3 className="text-white font-bold text-sm uppercase tracking-widest">{title}</h3>
    </div>
  );
}

export default function NewIncidentWizard() {
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotificationStore();
  const submitted = (location.state as any)?.submitted;
  const submittedCase = (location.state as any)?.caseNumber;

  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);


  const [form, setForm] = useState<FormState>({
    alertAt: new Date().toISOString().slice(0, 16),
    alertMode: 'Phone',
    notifierName: 'John Kamau',
    notifierPhone: '0712345678',
    locationName: 'Kenyatta Avenue, CBD Nairobi',
    subCounty: 'Starehe',
    lat: -1.2867,
    lng: 36.8172,
    patientName: 'Mary Wanjiku',
    patientAge: '34',
    patientGender: 'Female',
    chiefComplaint: 'Road traffic accident victim, multiple injuries to lower limbs. Patient conscious and alert.',
    watcherComments: 'Patient found at scene, conscious, GCS 14. Complaining of severe pain in left leg.',
    massCasualty: false,
    alertNature: 'Trauma',
    alertNatureDetail: 'Road Traffic Accident',
    preHospitalManagement: 'Tourniquet applied to left leg, IV access obtained, 500ml NS infusing.',
    originOfAlert: 'Community',
    nextOfKin: 'Peter Kamau',
    nextOfKinPhone: '0722987654',
    placeOfReferral: 'Kenyatta National Hospital',
  });

  const set = (updates: Partial<FormState>) => setForm(prev => ({ ...prev, ...updates }));


  const fetchLocationSuggestions = async (query: string) => {
  if (!query.trim() || query.length < 3) {
    setLocationSuggestions([]);
    return;
  }

  setIsLoadingSuggestions(true);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query + ', Nairobi, Kenya'
      )}&limit=5`
    );

    const data = await res.json();

    setLocationSuggestions(data || []);
  } catch {
    setLocationSuggestions([]);
  } finally {
    setIsLoadingSuggestions(false);
  }
};
  
  const searchLocation = async () => {

    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Nairobi, Kenya')}&limit=1`);
      const data = await res.json();
      if (data?.length > 0) {
        set({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), locationName: searchQuery });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    set({ lat, lng });
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data?.display_name) {
        const name = data.display_name.split(',').slice(0, 2).join(',').trim();
        set({ locationName: name });
        setSearchQuery(name);
      }
    } catch {}
  };

  const mutation = useMutation({
    mutationFn: () => api.post('/incidents', {
      alertMode: form.alertMode,
      alertAt: form.alertAt,
      originOfAlert: form.originOfAlert || undefined,
      notifierDetails: [{ name: form.notifierName, phone: form.notifierPhone }],
      locationName: form.locationName,
      subCounty: form.subCounty,
      lat: form.lat,
      lng: form.lng,
      patientName: form.patientName || undefined,
      patientAge: form.patientAge || undefined,
      patientGender: form.patientGender || undefined,
      nextOfKin: form.nextOfKin || undefined,
      nextOfKinPhone: form.nextOfKinPhone || undefined,
      chiefComplaint: form.chiefComplaint,
      massCasualty: form.massCasualty,
      alertNature: form.alertNature || undefined,
      alertNatureDetail: form.alertNatureDetail || undefined,
      preHospitalManagement: form.preHospitalManagement || undefined,
      watcherComments: form.watcherComments || undefined,
      placeOfReferral: form.placeOfReferral || undefined,
      status: 'SUBMITTED',
    }),
    onSuccess: (res) => {
      const caseNumber = res?.data?.data?.caseNumber ?? '';
      navigate('/watcher/new-incident', { state: { submitted: true, caseNumber } });
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: err?.response?.data?.message || 'Could not submit incident.',
      });
    },
  });

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-8 gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center">
          <CheckCircle size={36} weight="fill" className="text-brand-green" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-brand-teal">Incident Submitted</h2>
          {submittedCase && (
            <p className="text-sm text-slate-500 mt-1">Case <span className="font-semibold text-brand-teal">{submittedCase}</span> is now in the dispatch queue.</p>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/watcher/new-incident', { replace: true, state: {} })} className="px-5 py-2.5 border border-slate-200 text-brand-teal text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2">
            <PaperPlaneRight size={16} /> Submit Another
          </button>
          <button onClick={() => navigate('/watcher')} className="px-5 py-2.5 bg-brand-teal text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-0.5">Home / Add Alert</p>
          <h1 className="text-xl font-bold text-slate-800">Manage Alerts</h1>
        </div>
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
          <X size={20} weight="bold" />
        </button>
      </div>

      <div className="p-6">
        <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── LEFT: Basic Information ── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <SectionHeader title="Basic Information" />
              <div className="p-5 space-y-4">

                <div>
                  <label className={labelCls}>Alert Date & Time</label>
                  <input type="datetime-local" className={inputCls} value={form.alertAt} onChange={e => set({ alertAt: e.target.value })} />
                </div>

                <div>
                  <label className={labelCls}>Mode Of Alert</label>
                  <select className={inputCls} value={form.alertMode} onChange={e => set({ alertMode: e.target.value })}>
                    {ALERT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Notifier Name</label>
                    <input type="text" placeholder="Notifier Name" className={inputCls} value={form.notifierName} onChange={e => set({ notifierName: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Notifier Phone Number</label>
                    <input type="tel" placeholder="Enter Phone Number" className={inputCls} value={form.notifierPhone} onChange={e => set({ notifierPhone: e.target.value })} />
                  </div>
                </div>

                <div>
                  <div>
  <label className={labelCls}>
    Exact Incident Location
    <span className="text-red-500 ml-1">*</span>
  </label>

  <p className="text-xs text-slate-400 mb-2">
    Start typing a road, estate, building, landmark, or area.
  </p>

  <div className="relative">
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="e.g. Kenyatta Avenue, Westlands, JKIA..."
        className={inputCls}
        value={form.locationName}
        onChange={async (e) => {
          const value = e.target.value;

          set({
            locationName: value,
          });

          setSearchQuery(value);

          await fetchLocationSuggestions(value);
        }}
      />

      <button
        type="button"
        onClick={() => setShowMap(v => !v)}
        className="h-10 px-3 border border-slate-200 rounded-lg text-brand-teal hover:bg-brand-teal/5 transition-all flex items-center gap-1 shrink-0 text-xs font-semibold"
      >
        <MapPin size={14} weight="fill" />
        Map
      </button>
    </div>

    {locationSuggestions.length > 0 && (
      <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
        {locationSuggestions.map((place, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              set({
                locationName: place.display_name,
                lat: parseFloat(place.lat),
                lng: parseFloat(place.lon),
              });

              setSearchQuery(place.display_name);

              setLocationSuggestions([]);
            }}
            className="w-full text-left px-4 py-3 hover:bg-brand-teal/5 border-b border-slate-100 last:border-b-0"
          >
            <div className="flex items-start gap-2">
              <MapPin
                size={14}
                weight="fill"
                className="text-brand-teal mt-1"
              />

              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {place.display_name.split(',')[0]}
                </p>

                <p className="text-xs text-slate-400 mt-0.5">
                  {place.display_name}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    )}

    {isLoadingSuggestions && (
      <div className="absolute right-3 top-3 text-xs text-slate-400">
        Searching...
      </div>
    )}
  </div>
</div>
                  
                </div>

                {/* Inline map */}
                {showMap && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="flex gap-2 p-3 border-b border-slate-100 bg-slate-50">
                      <input type="text" placeholder="Search location..." className="flex-1 h-9 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-teal" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchLocation())} />
                      <button type="button" onClick={searchLocation} disabled={isSearching} className="h-9 px-4 bg-brand-teal text-white rounded-lg text-xs font-bold disabled:opacity-50">
                        {isSearching ? '...' : <MagnifyingGlass size={14} />}
                      </button>
                    </div>
                    <Map center={[form.lat, form.lng]} zoom={14} markers={[{ id: 'scene', lat: form.lat, lng: form.lng, title: form.locationName || 'Scene', type: 'incident' }]} onLocationSelect={handleMapClick} layerType="street" className="h-52 w-full" />
                    {form.locationName && (
                      <div className="px-3 py-2 bg-brand-green/5 border-t border-brand-green/20 text-xs text-brand-green font-semibold flex items-center gap-1">
                        <MapPin size={12} weight="fill" /> {form.locationName} · {form.lat.toFixed(4)}, {form.lng.toFixed(4)}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className={labelCls}>Sub County</label>
                  <select className={inputCls} value={form.subCounty} onChange={e => set({ subCounty: e.target.value })}>
                    <option value="">Select Sub County</option>
                    {SUB_COUNTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Patient Name</label>
                  <input type="text" placeholder="Enter Patient Name" className={inputCls} value={form.patientName} onChange={e => set({ patientName: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Age</label>
                    <input type="text" placeholder="Age" className={inputCls} value={form.patientAge} onChange={e => set({ patientAge: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Sex</label>
                    <select className={inputCls} value={form.patientGender} onChange={e => set({ patientGender: e.target.value })}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Chief Complaints <span className="text-red-400">*</span></label>
                  <textarea rows={3} placeholder="Enter chief complaints..." className={textareaCls} value={form.chiefComplaint} onChange={e => set({ chiefComplaint: e.target.value })} required />
                </div>

                <div>
                  <label className={labelCls}>Management Given</label>
                  <textarea rows={3} placeholder="Enter management given..." className={textareaCls} value={form.watcherComments} onChange={e => set({ watcherComments: e.target.value })} />
                </div>

                <label className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${form.massCasualty ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-red-300'}`}>
                  <input type="checkbox" className="w-4 h-4 mt-0.5 accent-red-500" checked={form.massCasualty} onChange={e => set({ massCasualty: e.target.checked })} />
                  <div>
                    <p className="font-bold text-red-500 text-sm">Declare Mass Casualty Incident (MCI)</p>
                    <p className="text-xs text-red-400 mt-0.5">Multiple victims requiring heavy response.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* ── RIGHT: Other Information ── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <SectionHeader title="Other Information" />
              <div className="p-5 space-y-4">

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Nature of Alert</label>
                    <select className={inputCls} value={form.alertNature} onChange={e => set({ alertNature: e.target.value, alertNatureDetail: '' })}>
                      <option value="">Select</option>
                      {NATURE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Specify Nature</label>
                    <select className={inputCls} value={form.alertNatureDetail} onChange={e => set({ alertNatureDetail: e.target.value })} disabled={!form.alertNature}>
                      <option value="">Select</option>
                      {(NATURE_DETAIL[form.alertNature] ?? []).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Pre Hospital Management</label>
                  <textarea rows={4} placeholder="Enter pre-hospital management..." className={textareaCls} value={form.preHospitalManagement} onChange={e => set({ preHospitalManagement: e.target.value })} />
                </div>

                <div>
                  <label className={labelCls}>Origin of Alert</label>
                  <select className={inputCls} value={form.originOfAlert} onChange={e => set({ originOfAlert: e.target.value })}>
                    <option value="">Select</option>
                    {ORIGIN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Next of Kin</label>
                    <input type="text" placeholder="Next of Kin" className={inputCls} value={form.nextOfKin} onChange={e => set({ nextOfKin: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Next of Kin Phone Number</label>
                    <input type="tel" placeholder="Next of Kin Phone Number" className={inputCls} value={form.nextOfKinPhone} onChange={e => set({ nextOfKinPhone: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Place of Referral</label>
                  <input type="text" placeholder="e.g. Kenyatta National Hospital" className={inputCls} value={form.placeOfReferral} onChange={e => set({ placeOfReferral: e.target.value })} />
                </div>

                {/* Divider — auto-filled fields */}
                <div className="pt-2">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Auto-assigned on dispatch</p>
                  <div className="space-y-3">
                    {['Dispatcher on duty', 'Ambulance medic on duty', 'Ambulance operator on duty', 'Ambulance Used'].map(label => (
                      <div key={label}>
                        <label className={labelCls}>{label}</label>
                        <div className="h-10 px-3 border border-dashed border-slate-200 rounded-lg flex items-center text-xs text-slate-300 font-semibold">
                          Assigned when task is dispatched
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit bar */}
          <div className="mt-6 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-6 py-4 shadow-sm">
            <button type="button" onClick={() => navigate(-1)} className="px-5 py-2 text-slate-500 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
              Cancel
            </button>
            {mutation.isError && (
              <p className="text-sm text-red-500 font-semibold">Submission failed — check your connection.</p>
            )}
            <button
              type="submit"
              disabled={mutation.isPending || !form.chiefComplaint || !form.locationName || !form.subCounty}
              className="flex items-center gap-2 px-8 py-2.5 bg-brand-teal text-white rounded-lg font-bold text-sm hover:opacity-90 transition-all shadow-md disabled:opacity-50"
            >
              <ClipboardText size={18} weight="bold" />
              {mutation.isPending ? 'Submitting...' : 'Submit Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
