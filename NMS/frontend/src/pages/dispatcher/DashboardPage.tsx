import { useQuery, useQueryClient } from '@tanstack/react-query';
import { WarningCircle, Broadcast, Truck, Timer, Stack, CornersOut, Ambulance, CheckCircle, WifiHigh, X } from '@phosphor-icons/react';
import api from '../../api/client';
import { Incident } from '../../types/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { socket } from '../../lib/socket';
import { useNotificationStore } from '../../stores/notificationStore';
import Map from '../../components/shared/Map';
import { useVehicleTracking } from '../../hooks/useVehicleTracking';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [mapLayer, setMapLayer] = useState<'light' | 'dark' | 'street'>('light');
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Query to get recent incidents
  const { data: incidentsData } = useQuery({
    queryKey: ['incidents', 'recent'],
    queryFn: async () => {
      const res = await api.get('/incidents?limit=10');
      return res.data.data as Incident[];
    },
  });

  // Query to get queue count
  const { data: queueData } = useQuery({
    queryKey: ['dispatch', 'queue'],
    queryFn: async () => {
      const res = await api.get('/dispatch/queue');
      return res.data.data as Incident[];
    },
  });

  const queryClient = useQueryClient();
  const { vehicles: liveVehicles, lastUpdatedAt } = useVehicleTracking();

  // Listen to real-time events
  useEffect(() => {
    socket.connect();
    
    socket.on('incident:new', () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch', 'queue'] });
      queryClient.invalidateQueries({ queryKey: ['incidents', 'recent'] });
    });

    return () => {
      socket.off('incident:new');
    };
  }, []);

  const queueCount = queueData?.length ?? 0;
  const recentIncidents = incidentsData ?? [];
  const availableVehicles = liveVehicles.filter(v => v.dbStatus === 'READY').length;

  const incidentMarkers = recentIncidents
    .filter(i => i.lat && i.lng)
    .map(inc => ({
      id: inc.id,
      lat: inc.lat!,
      lng: inc.lng!,
      title: `${inc.caseNumber} - ${inc.chiefComplaint}`,
      type: 'incident' as const,
    }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6 lg:gap-8 max-w-[1600px] mx-auto w-full">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div onClick={() => navigate('/queue')} className="bg-white border border-surface-border rounded-xl p-5 cursor-pointer hover:shadow-sm hover:border-status-danger/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-slate-text">Queue Count</p>
            <WarningCircle size={16} className="text-status-danger" />
          </div>
          <p className="text-3xl font-bold text-brand-teal leading-none">{queueCount}</p>
          <p className="text-xs text-slate-text mt-2">{queueCount > 0 ? 'Needs attention' : 'Queue clear'}</p>
        </div>

        <div onClick={() => navigate('/queue')} className="bg-white border border-surface-border rounded-xl p-5 cursor-pointer hover:shadow-sm hover:border-brand-green/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-slate-text">Active Operations</p>
            <Broadcast size={16} className="text-brand-green" />
          </div>
          <p className="text-3xl font-bold text-brand-teal leading-none">
            {recentIncidents.filter(i => i.status === 'DISPATCH_HANDLING' || i.status === 'DISPATCHED').length}
          </p>
          <p className="text-xs text-slate-text mt-2">Currently dispatched</p>
        </div>

        <div onClick={() => navigate('/fleet')} className="bg-white border border-surface-border rounded-xl p-5 cursor-pointer hover:shadow-sm hover:border-brand-teal/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-slate-text">Available Units</p>
            <Truck size={16} className="text-brand-teal/60" />
          </div>
          <p className="text-3xl font-bold text-brand-teal leading-none">{availableVehicles}</p>
          <p className="text-xs text-slate-text mt-2">Ready for dispatch</p>
        </div>

        <div className="bg-brand-sidebar rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-slate-400">Avg Response</p>
            <Timer size={16} className="text-brand-green" />
          </div>
          <p className="text-3xl font-bold text-white leading-none">—</p>
          <p className="text-xs text-white/30 mt-2">Target: 8:00</p>
        </div>
      </div>


      {/* Main Layout: Map & Queue List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
        {/* Mini Map Section (8 Cols) */}
        <div className={`lg:col-span-8 bg-white border border-surface-border rounded-xl shadow-sm overflow-hidden flex flex-col transition-all duration-500 ${
          isMapExpanded ? 'fixed inset-4 z-[100] shadow-2xl' : 'relative'
        }`}>
          <div className="px-5 py-3.5 border-b border-surface-border flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <h2 className="font-semibold text-sm text-brand-teal">Operational Map</h2>
              {isMapExpanded && <span className="bg-brand-green/10 text-brand-green text-xs font-medium px-2.5 py-0.5 rounded-md">Full Scale</span>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const layers: ('light' | 'dark' | 'street')[] = ['light', 'dark', 'street'];
                  const nextLayer = layers[(layers.indexOf(mapLayer) + 1) % layers.length];
                  setMapLayer(nextLayer);
                  addNotification({ type: 'info', title: 'Layer Changed', message: `Map layer set to ${nextLayer}.` });
                }}
                className="border border-surface-border px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 rounded-lg hover:bg-slate-50 transition-all text-slate-text"
              >
                <Stack size={14} weight="bold" /> Layers
              </button>
              <button
                onClick={() => {
                  setIsMapExpanded(!isMapExpanded);
                  if (!isMapExpanded) {
                    addNotification({ type: 'info', title: 'Tactical View', message: 'Map expanded to full scale.' });
                  }
                }}
                className="border border-surface-border px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 rounded-lg hover:bg-slate-50 transition-all text-slate-text"
              >
                {isMapExpanded ? (
                  <><X size={14} weight="bold" /> Close</>
                ) : (
                  <><CornersOut size={14} weight="bold" /> Expand</>
                )}
              </button>
            </div>
          </div>
          <div className={`relative flex-1 bg-slate-200 ${isMapExpanded ? 'h-full' : 'min-h-[300px] sm:min-h-[400px] lg:min-h-[550px]'}`}>
            {/* Real Interactive Map */}
            <Map
              center={[-1.2921, 36.8219]}
              zoom={isMapExpanded ? 14 : 12}
              markers={incidentMarkers}
              vehicleMarkers={liveVehicles}
              layerType={mapLayer}
              showLiveBadge
              showLegend
              showVehicleList
              lastUpdatedAt={lastUpdatedAt}
            />
          </div>
        </div>

        {/* Queue Preview (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-surface-border rounded-xl shadow-sm flex flex-col h-[400px] lg:h-[615px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-surface-border flex justify-between items-center">
            <h2 className="font-semibold text-sm text-brand-teal">Queue Preview</h2>
            {queueCount > 0 && <span className="bg-status-danger/10 text-status-danger text-xs font-medium px-2.5 py-0.5 rounded-md">{queueCount} pending</span>}
          </div>
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left bg-slate-50/50 border-b border-surface-border">
                  <th className="px-5 py-3 text-xs font-medium text-slate-text">ID</th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-text">Description</th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-text">Wait</th>
                </tr>
              </thead>
              <tbody>
                {queueData ? queueData.slice(0, 8).map(incident => (
                  <tr
                    key={incident.id}
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                    className="border-b border-surface-border/50 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-brand-teal">{incident.caseNumber}</span>
                        <span className={`text-xs mt-0.5 ${
                          incident.status === 'SUBMITTED' ? 'text-status-danger' :
                          incident.status === 'DISPATCH_HANDLING' ? 'text-status-warning' : 'text-status-info'
                        }`}>{incident.status.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-sm text-brand-teal line-clamp-1">{incident.chiefComplaint}</span>
                        <span className="text-xs text-slate-text mt-0.5">{incident.locationName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${Date.now() - new Date(incident.createdAt).getTime() > 600_000 ? 'bg-status-danger animate-pulse' : 'bg-brand-green'}`}></div>
                        <span className={`text-xs ${Date.now() - new Date(incident.createdAt).getTime() > 600_000 ? 'text-status-danger' : 'text-slate-text'}`}>
                          {formatDistanceToNow(new Date(incident.createdAt))}
                        </span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center text-sm text-slate-text">Queue is clear</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-surface-border">
            <button
              onClick={() => navigate('/queue')}
              className="w-full bg-brand-teal text-white py-3 rounded-lg text-sm font-medium hover:bg-brand-teal/90 transition-colors flex items-center justify-center gap-2"
            >
              <Stack size={16} weight="bold" />
              View Full Queue
            </button>
          </div>
        </div>

      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-surface-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Broadcast size={18} className="text-slate-text" />
          </div>
          <div>
            <p className="text-xs text-slate-text">Cases In Progress</p>
            <p className="text-sm font-semibold text-brand-teal mt-0.5">
              {recentIncidents.filter(i => i.status === 'DISPATCH_HANDLING' || i.status === 'DISPATCHED').length} active
            </p>
          </div>
        </div>
        <div className="bg-white border border-surface-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Ambulance size={18} className="text-slate-text" />
          </div>
          <div>
            <p className="text-xs text-slate-text">Vehicles Tracked</p>
            <p className="text-sm font-semibold text-brand-teal mt-0.5">{liveVehicles.length} units</p>
          </div>
        </div>
        <div className="bg-white border border-surface-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <WifiHigh size={18} className="text-slate-text" />
          </div>
          <div>
            <p className="text-xs text-slate-text">GPS Last Update</p>
            <p className="text-sm font-semibold text-brand-teal mt-0.5">
              {lastUpdatedAt ? formatDistanceToNow(lastUpdatedAt, { addSuffix: true }) : 'Waiting…'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
