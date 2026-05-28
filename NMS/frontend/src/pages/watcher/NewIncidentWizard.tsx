import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  CheckCircle, MapPin, PaperPlaneRight, ClipboardText,
  MagnifyingGlass, X, WarningOctagon, Clock, MapTrifold,
} from '@phosphor-icons/react';
import api from '../../api/client';
import Map from '../../components/shared/Map';
import { useNotificationStore } from '../../stores/notificationStore';

const SUB_COUNTIES = [
  'Dagoretti North', 'Dagoretti South', 'Embakasi Central', 'Embakasi East',
  'Embakasi North', 'Embakasi South', 'Embakasi West', 'Kamukunji', 'Kasarani',
  'Kibra', "Lang'ata", 'Makadara', 'Mathare', 'Roysambu', 'Ruaraka', 'Starehe', 'Westlands',
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

/* ── Shared style tokens ── */
const inputCls =
  'w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm ' +
  'focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none ' +
  'text-slate-800 placeholder:text-slate-300 transition-colors duration-150';

const selectCls =
  'w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm ' +
  'focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none ' +
  'text-slate-800 transition-colors duration-150 cursor-pointer';

const textareaCls =
  'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm ' +
  'focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none ' +
  'text-slate-800 placeholder:text-slate-300 transition-colors duration-150 leading-relaxed';

const labelCls = 'block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider';

/* ── Sub-components ── */
function SectionHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
      <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
        {step}
      </span>
      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{title}</h3>
    </div>
  );
}

function GhostField({ label }: { label: string }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="h-9 px-3 border border-dashed border-slate-200 rounded-lg flex items-center gap-2 text-xs text-slate-300 font-medium">
        <Clock size={13} className="shrink-0" />
        Assigned when dispatched
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function NewIncidentWizard() {
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
    notifierName: '',
    notifierPhone: '',
    locationName: '',
    subCounty: '',
    lat: -1.2867,
    lng: 36.8172,
    patientName: '',
    patientAge: '',
    patientGender: '',
    chiefComplaint: '',
    watcherComments: '',
    massCasualty: false,
    alertNature: '',
    alertNatureDetail: '',
    preHospitalManagement: '',
    originOfAlert: '',
    nextOfKin: '',
    nextOfKinPhone: '',
    placeOfReferral: '',
  });

  const set = (updates: Partial<FormState>) => setForm(prev => ({ ...prev, ...updates }));

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Nairobi, Kenya')}&limit=1`
      );
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
    mutationFn: () =>
      api.post('/incidents', {
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
    onSuccess: res => {
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

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-8 gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
          <CheckCircle size={36} weight="fill" className="text-teal-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-teal-700">Incident Submitted</h2>
          {submittedCase && (
            <p className="text-sm text-slate-500 mt-1">
              Case <span className="font-semibold text-teal-600">{submittedCase}</span> is now in the dispatch queue.
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/watcher/new-incident', { replace: true, state: {} })}
            className="px-5 py-2.5 border border-slate-200 text-teal-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <PaperPlaneRight size={16} /> Submit Another
          </button>
          <button
            onClick={() => navigate('/watcher')}
            className="px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* ── Main form ── */
  return (
    <div className="min-h-screen bg-slate-50/80">

      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
            Home / Alerts / New Incident
          </p>
          <h1 className="text-lg font-bold text-slate-800">Report New Incident</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-500 text-[11px] font-semibold rounded-full border border-red-100">
            <WarningOctagon size={12} weight="fill" />
            Emergency Form
          </span>
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
            aria-label="Close"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
      </div>

      <div className="p-5">
        <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* ── LEFT: Basic Information ── */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <SectionHeader step={1} title="Basic Information" />
              <div className="p-5 space-y-4">

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Alert Date & Time</label>
                    <input
                      type="datetime-local"
                      className={inputCls}
                      value={form.alertAt}
                      onChange={e => set({ alertAt: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Mode of Alert</label>
                    <select className={selectCls} value={form.alertMode} onChange={e => set({ alertMode: e.target.value })}>
                      {ALERT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Notifier Name</label>
                    <input
                      type="text"
                      placeholder="Full name"
                      className={inputCls}
                      value={form.notifierName}
                      onChange={e => set({ notifierName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Notifier Phone</label>
                    <input
                      type="tel"
                      placeholder="07XX XXX XXX"
                      className={inputCls}
                      value={form.notifierPhone}
                      onChange={e => set({ notifierPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} weight="fill" className="text-teal-500" />
                      Location of Incidence <span className="text-red-400 ml-0.5">*</span>
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter or pick location on map"
                      className={inputCls}
                      value={form.locationName}
                      onChange={e => set({ locationName: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowMap(v => !v)}
                      className={`h-9 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                        showMap
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'border-slate-200 text-teal-600 hover:bg-teal-50 hover:border-teal-200'
                      }`}
                    >
                      <MapTrifold size={14} weight={showMap ? 'fill' : 'regular'} />
                      Map
                    </button>
                  </div>
                </div>

                {/* Inline map */}
                {showMap && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="flex gap-2 p-3 border-b border-slate-100 bg-slate-50">
                      <input
                        type="text"
                        placeholder="Search location..."
                        className="flex-1 h-8 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchLocation())}
                      />
                      <button
                        type="button"
                        onClick={searchLocation}
                        disabled={isSearching}
                        className="h-8 px-3 bg-teal-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-teal-700 transition-colors"
                      >
                        {isSearching ? '…' : <MagnifyingGlass size={13} />}
                      </button>
                    </div>
                    <Map
                      center={[form.lat, form.lng]}
                      zoom={14}
                      markers={[{ id: 'scene', lat: form.lat, lng: form.lng, title: form.locationName || 'Scene', type: 'incident' }]}
                      onLocationSelect={handleMapClick}
                      layerType="street"
                      className="h-52 w-full"
                    />
                    {form.locationName && (
                      <div className="px-3 py-2 bg-teal-50 border-t border-teal-100 text-xs text-teal-700 font-semibold flex items-center gap-1.5">
                        <MapPin size={11} weight="fill" />
                        {form.locationName} · {form.lat.toFixed(4)}, {form.lng.toFixed(4)}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className={labelCls}>Sub County <span className="text-red-400">*</span></label>
                  <select className={selectCls} value={form.subCounty} onChange={e => set({ subCounty: e.target.value })}>
                    <option value="">Select sub county</option>
                    {SUB_COUNTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Patient details divider */}
                <div className="pt-1">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest pb-3 border-b border-slate-100">
                    Patient Details
                  </p>
                </div>

                <div>
                  <label className={labelCls}>Patient Name</label>
                  <input
                    type="text"
                    placeholder="Full name (if known)"
                    className={inputCls}
                    value={form.patientName}
                    onChange={e => set({ patientName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Age</label>
                    <input
                      type="text"
                      placeholder="Years"
                      className={inputCls}
                      value={form.patientAge}
                      onChange={e => set({ patientAge: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Sex</label>
                    <select className={selectCls} value={form.patientGender} onChange={e => set({ patientGender: e.target.value })}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>
                    Chief Complaints <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the chief complaints..."
                    className={textareaCls}
                    value={form.chiefComplaint}
                    onChange={e => set({ chiefComplaint: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>Management Given</label>
                  <textarea
                    rows={3}
                    placeholder="Describe management provided at the scene..."
                    className={textareaCls}
                    value={form.watcherComments}
                    onChange={e => set({ watcherComments: e.target.value })}
                  />
                </div>

                {/* MCI toggle */}
                <label
                  className={`flex items-start gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                    form.massCasualty
                      ? 'border-red-400 bg-red-50'
                      : 'border-slate-200 hover:border-red-200 hover:bg-red-50/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 accent-red-500 shrink-0"
                    checked={form.massCasualty}
                    onChange={e => set({ massCasualty: e.target.checked })}
                  />
                  <div>
                    <p className={`font-bold text-sm flex items-center gap-1.5 ${form.massCasualty ? 'text-red-500' : 'text-slate-500'}`}>
                      <WarningOctagon size={14} weight="fill" />
                      Declare Mass Casualty Incident (MCI)
                    </p>
                    <p className={`text-xs mt-0.5 ${form.massCasualty ? 'text-red-400' : 'text-slate-400'}`}>
                      Multiple victims requiring heavy emergency response
                    </p>
                  </div>
                </label>

              </div>
            </div>

            {/* ── RIGHT: Other Information ── */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <SectionHeader step={2} title="Additional Information" />
              <div className="p-5 space-y-4">

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Nature of Alert</label>
                    <select
                      className={selectCls}
                      value={form.alertNature}
                      onChange={e => set({ alertNature: e.target.value, alertNatureDetail: '' })}
                    >
                      <option value="">Select</option>
                      {NATURE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Specify Nature</label>
                    <select
                      className={selectCls}
                      value={form.alertNatureDetail}
                      onChange={e => set({ alertNatureDetail: e.target.value })}
                      disabled={!form.alertNature}
                    >
                      <option value="">Select</option>
                      {(NATURE_DETAIL[form.alertNature] ?? []).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Origin of Alert</label>
                  <select className={selectCls} value={form.originOfAlert} onChange={e => set({ originOfAlert: e.target.value })}>
                    <option value="">Select</option>
                    {ORIGIN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Pre-Hospital Management</label>
                  <textarea
                    rows={4}
                    placeholder="Describe interventions performed before hospital arrival..."
                    className={textareaCls}
                    value={form.preHospitalManagement}
                    onChange={e => set({ preHospitalManagement: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Next of Kin</label>
                    <input
                      type="text"
                      placeholder="Full name"
                      className={inputCls}
                      value={form.nextOfKin}
                      onChange={e => set({ nextOfKin: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Next of Kin Phone</label>
                    <input
                      type="tel"
                      placeholder="07XX XXX XXX"
                      className={inputCls}
                      value={form.nextOfKinPhone}
                      onChange={e => set({ nextOfKinPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Place of Referral</label>
                  <input
                    type="text"
                    placeholder="e.g. Kenyatta National Hospital"
                    className={inputCls}
                    value={form.placeOfReferral}
                    onChange={e => set({ placeOfReferral: e.target.value })}
                  />
                </div>

                {/* Auto-assigned divider */}
                <div className="pt-1">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest pb-3 border-b border-slate-100">
                    Auto-assigned on Dispatch
                  </p>
                </div>

                <div className="space-y-3">
                  <GhostField label="Dispatcher on Duty" />
                  <GhostField label="Ambulance Medic on Duty" />
                  <GhostField label="Ambulance Operator on Duty" />
                  <GhostField label="Ambulance Used" />
                </div>

              </div>
            </div>
          </div>

          {/* Submit bar */}
          <div className="mt-5 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-3.5 shadow-sm">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-slate-500 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>

            <p className="text-xs text-slate-400">
              <span className="text-red-400">*</span> Required fields
            </p>

            {mutation.isError && (
              <p className="text-sm text-red-500 font-semibold">Submission failed — check your connection.</p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending || !form.chiefComplaint || !form.locationName || !form.subCounty}
              className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg font-bold text-sm hover:bg-teal-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ClipboardText size={16} weight="bold" />
              {mutation.isPending ? 'Submitting…' : 'Submit Incident'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}