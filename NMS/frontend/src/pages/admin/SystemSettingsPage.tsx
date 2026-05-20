import { SlidersHorizontal, ShieldStar, Database, PlugsConnected, Download, ToggleLeft, ToggleRight, CheckCircle } from '@phosphor-icons/react';
import { useState } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';

export default function SystemSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const { addNotification } = useNotificationStore();

  const handleMaintenanceToggle = () => {
    setMaintenanceMode(!maintenanceMode);
    addNotification({
      type: !maintenanceMode ? 'warning' : 'success',
      title: 'System State Changed',
      message: !maintenanceMode ? 'Maintenance mode engaged. New connections suspended.' : 'Maintenance mode disabled. System operating normally.',
    });
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-6">
      <div className="mb-4">
        <h2 className="font-sans text-[32px] font-bold text-brand-teal">System Configuration</h2>
        <p className="font-sans text-base text-slate-text mt-1">Manage global platform behaviors and integration hooks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Settings List */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Section 1 */}
          <div className="bg-white border border-surface-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-surface-border bg-slate-50 flex items-center gap-3">
              <ShieldStar size={20} className="text-slate-text" />
              <h3 className="font-semibold text-brand-teal">Security & Access</h3>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-sans text-sm font-bold text-slate-800">Two-Factor Authentication (2FA)</h4>
                  <p className="font-sans text-sm text-slate-500 mt-1">Require 2FA for all Super Admin and Admin roles.</p>
                </div>
                <button 
                  onClick={() => addNotification({ type: 'warning', title: 'Setting Changed', message: '2FA requirement updated.' })}
                  className="text-brand-green"
                >
                  <ToggleRight size={40} weight="fill" />
                </button>
              </div>
              <div className="flex justify-between items-center border-t border-surface-border pt-6">
                <div>
                  <h4 className="font-sans text-sm font-bold text-slate-800">Session Timeout</h4>
                  <p className="font-sans text-sm text-slate-500 mt-1">Automatically log out inactive dispatchers.</p>
                </div>
                <select className="bg-slate-50 border border-surface-border rounded-lg px-4 py-2 text-sm outline-none">
                  <option>15 Minutes</option>
                  <option>30 Minutes</option>
                  <option>1 Hour</option>
                  <option>Never</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white border border-surface-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-surface-border bg-slate-50 flex items-center gap-3">
              <PlugsConnected size={20} className="text-slate-text" />
              <h3 className="font-semibold text-brand-teal">External Integrations</h3>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-sans text-sm font-bold text-slate-800">Kimiitrack GPS Sync</h4>
                  <p className="font-sans text-sm text-slate-500 mt-1">Pull telemetry from ambulance units every 5 seconds.</p>
                </div>
                <button 
                  onClick={() => addNotification({ type: 'info', title: 'Integration Updated', message: 'Kimiitrack GPS Sync toggled.' })}
                  className="text-brand-green"
                >
                  <ToggleRight size={40} weight="fill" />
                </button>
              </div>
              <div className="flex justify-between items-center border-t border-surface-border pt-6">
                <div>
                  <h4 className="font-sans text-sm font-bold text-slate-800">National SMS Gateway</h4>
                  <p className="font-sans text-sm text-slate-500 mt-1">Send SMS alerts to patients when dispatch is confirmed.</p>
                </div>
                <button 
                  onClick={() => addNotification({ type: 'info', title: 'Integration Updated', message: 'National SMS Gateway toggled.' })}
                  className="text-slate-300"
                >
                  <ToggleLeft size={40} weight="fill" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Health Widget */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-brand-sidebar p-6 rounded-xl flex flex-col gap-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Database size={20} className="text-brand-green" />
              <h3 className="font-sans text-lg font-bold">System Health</h3>
            </div>
            
            <div className="bg-black/20 p-4 rounded-lg flex items-center justify-between">
              <span className="font-sans text-sm text-slate-300">API Gateway</span>
              <span className="flex items-center gap-1 font-medium text-brand-green text-sm"><CheckCircle weight="fill" /> Online</span>
            </div>
            <div className="bg-black/20 p-4 rounded-lg flex items-center justify-between">
              <span className="text-sm text-slate-300">Socket Cluster</span>
              <span className="flex items-center gap-1 font-medium text-brand-green text-sm"><CheckCircle weight="fill" /> Online</span>
            </div>
            <div className="bg-black/20 p-4 rounded-lg flex items-center justify-between">
              <span className="font-sans text-sm text-slate-300">Redis Cache</span>
              <span className="flex items-center gap-1 font-bold text-status-warning text-sm"><CheckCircle weight="fill" /> Degraded</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="font-sans text-sm text-status-warning font-bold">Maintenance Mode</span>
                <button onClick={handleMaintenanceToggle} className={maintenanceMode ? 'text-status-warning' : 'text-slate-500'}>
                  {maintenanceMode ? <ToggleRight size={40} weight="fill" /> : <ToggleLeft size={40} weight="fill" />}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-surface-border">
            <h4 className="font-semibold text-brand-teal mb-4">Data Management</h4>
            <button
              onClick={() => addNotification({ type: 'success', title: 'Export Complete', message: 'Audit logs exported to CSV.' })}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all text-brand-teal border border-surface-border"
            >
              <span className="text-sm font-medium">Export Audit Logs</span>
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
