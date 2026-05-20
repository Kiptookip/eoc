import { Clock, Ambulance, Download, MapPinLine, Warning } from '@phosphor-icons/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useNotificationStore } from '../../stores/notificationStore';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { Incident } from '../../types/api';
import { useVehicleTracking } from '../../hooks/useVehicleTracking';

const responseTimeData = [
  { time: '08:00', avg: 5.2, target: 8.0 },
  { time: '09:00', avg: 4.8, target: 8.0 },
  { time: '10:00', avg: 6.1, target: 8.0 },
  { time: '11:00', avg: 7.4, target: 8.0 },
  { time: '12:00', avg: 9.2, target: 8.0 },
  { time: '13:00', avg: 6.8, target: 8.0 },
  { time: '14:00', avg: 5.5, target: 8.0 },
];

export default function AnalyticsPage() {
  const { addNotification } = useNotificationStore();
  const { vehicles: liveVehicles } = useVehicleTracking();

  const { data: incidents } = useQuery({
    queryKey: ['analytics', 'incidents'],
    queryFn: async () => {
      const res = await api.get('/incidents?limit=100');
      return res.data.data as Incident[];
    },
  });

  const totalIncidents = incidents?.length ?? 0;
  const submittedCount = incidents?.filter(i => i.status === 'SUBMITTED').length ?? 0;
  const resolvedCount = incidents?.filter(i => i.status === 'RESOLVED').length ?? 0;
  const fleetUtilization = liveVehicles.length > 0
    ? Math.round((liveVehicles.filter(v => v.ignition || v.speed > 0).length / liveVehicles.length) * 100)
    : null;

  const subCountyCounts = incidents?.reduce((acc, i) => {
    if (!i.subCounty) return acc;
    acc[i.subCounty] = (acc[i.subCounty] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};
  const hotZone = Object.entries(subCountyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const fleetData = Object.entries(subCountyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([sector, count]) => ({ sector, incidents: count }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6 lg:gap-8 max-w-[1600px] mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 rounded-xl border border-surface-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-brand-teal">Analytics</h2>
          <p className="text-xs text-slate-text mt-0.5">Operational performance and incident data</p>
        </div>
        <button
          onClick={() => addNotification({ type: 'success', title: 'Export Complete', message: 'The analytics report has been downloaded.' })}
          className="w-full sm:w-auto bg-white border border-surface-border text-brand-teal hover:bg-slate-50 px-5 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all"
        >
          <Download size={18} weight="bold" />
          Export Report
        </button>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-slate-text">Total Incidents</p>
            <Clock size={16} weight="fill" className="text-brand-green" />
          </div>
          <p className="text-3xl font-bold text-brand-teal leading-none">{totalIncidents}</p>
          <p className="text-xs font-medium text-brand-green mt-2">{resolvedCount} resolved</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-slate-text">Fleet Utilization</p>
            <Ambulance size={16} weight="fill" className="text-status-info" />
          </div>
          <p className="text-3xl font-bold text-brand-teal leading-none">
            {fleetUtilization !== null ? `${fleetUtilization}%` : '—'}
          </p>
          <p className="text-xs text-slate-text mt-2">{liveVehicles.length} vehicles tracked</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-slate-text">Awaiting Dispatch</p>
            <Warning size={16} weight="fill" className="text-status-danger" />
          </div>
          <p className="text-3xl font-bold text-brand-teal leading-none">{submittedCount}</p>
          <p className={`text-xs font-medium mt-2 ${submittedCount > 0 ? 'text-status-danger' : 'text-slate-text'}`}>
            {submittedCount > 0 ? 'Needs attention' : 'Queue clear'}
          </p>
        </div>

        <div className="bg-brand-sidebar p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-slate-400">Incident Hotzone</p>
            <MapPinLine size={16} weight="fill" className="text-brand-green" />
          </div>
          <p className="text-3xl font-bold text-white leading-none truncate">{hotZone}</p>
          <p className="text-xs text-brand-green mt-2">{subCountyCounts[hotZone] ?? 0} cases logged</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        
        {/* Response Time Area Chart */}
        <div className="bg-white p-6 rounded-xl border border-surface-border shadow-sm flex flex-col h-[420px]">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-brand-teal">Response Performance</h3>
            <p className="text-xs text-slate-400 mt-0.5">TAT trend — sample data</p>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={responseTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#88c241" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#88c241" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dx={-10} />
                <RechartsTooltip
                  cursor={{ stroke: '#88c241', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: '#fff', color: '#000' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="target" stroke="#cbd5e1" strokeDasharray="6 6" fill="none" strokeWidth={1.5} name="Benchmark (8m)" />
                <Area type="monotone" dataKey="avg" stroke="#88c241" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAvg)" name="Actual TAT" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-surface-border shadow-sm flex flex-col h-[420px]">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-brand-teal">Incidents by Sub-County</h3>
            <p className="text-xs text-slate-400 mt-0.5">Top 5 areas by case volume</p>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fleetData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="sector" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dx={-10} />
                <RechartsTooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: '#fff', color: '#000' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                />
                <Bar dataKey="incidents" name="Cases" fill="#88c241" radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
