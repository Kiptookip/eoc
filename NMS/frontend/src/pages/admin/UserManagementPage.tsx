import { useState } from 'react';
import { 
  UserPlus, MagnifyingGlass, Faders, DotsThreeVertical, 
  Download, ClockCounterClockwise, MagicWand, CaretLeft, 
  CaretRight, TrendUp, ShieldCheck 
} from '@phosphor-icons/react';
import { useNotificationStore } from '../../stores/notificationStore';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { User, Agency, PaginatedResponse, Role } from '../../types/api';
import AddPersonnelModal from '../../components/shared/AddPersonnelModal';

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [agencyFilter, setAgencyFilter] = useState('ALL');
  const { addNotification } = useNotificationStore();
  
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['admin', 'users', currentPage, roleFilter, agencyFilter],
    queryFn: async () => {
      const params: any = { page: currentPage, limit: 10 };
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (agencyFilter !== 'ALL') params.agencyId = agencyFilter;
      const res = await api.get<PaginatedResponse<User>>('/admin/users', { params });
      return res.data;
    },
  });

  const { data: agencies = [] } = useQuery({
    queryKey: ['admin', 'agencies'],
    queryFn: async () => {
      const res = await api.get('/admin/agencies');
      return res.data.data as Agency[];
    },
  });

  const users = usersResponse?.data || [];
  const meta = usersResponse?.meta || { total: 0, page: 1, limit: 10, totalPages: 0 };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-brand-teal text-white';
      case 'ADMIN': return 'bg-brand-green text-white';
      case 'DISPATCHER': return 'bg-[#006973] text-white';
      case 'WATCHER': return 'bg-status-info text-white';
      default: return 'bg-slate-300 text-slate-700';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6 lg:gap-8 max-w-[1600px] mx-auto w-full">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 sm:p-6 lg:p-8 rounded-xl border border-surface-border shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-6 bg-brand-green rounded-full"></div>
            <p className="font-sans text-[11px] font-black tracking-[0.2em] text-slate-text uppercase text-xs sm:text-[11px]">Personnel & Identity Bureau</p>
          </div>
          <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-black text-brand-teal tracking-tight uppercase">Personnel Roster</h2>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto bg-brand-green hover:bg-brand-sidebar hover:text-white text-brand-teal font-black text-xs uppercase tracking-widest px-6 py-3 sm:px-8 sm:py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-md active:scale-95"
        >
          <UserPlus size={22} weight="bold" />
          Enlist Personnel
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-surface-border p-6 rounded-xl shadow-sm group hover:border-brand-green transition-all">
          <div className="font-sans text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-2">Total Personnel</div>
          <div className="font-sans text-4xl font-black text-brand-teal leading-none">{meta.total}</div>
          <div className="font-sans text-[10px] font-black text-brand-green mt-4 flex items-center gap-1 uppercase tracking-tighter">
            <TrendUp size={14} weight="bold" /> {meta.totalPages} page{meta.totalPages !== 1 ? 's' : ''} of records
          </div>
        </div>
        
        <div className="bg-white border border-surface-border p-6 rounded-xl shadow-sm group hover:border-status-info transition-all">
          <div className="font-sans text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-2">Active Accounts</div>
          <div className="font-sans text-4xl font-black text-brand-teal leading-none">
            {users.filter(u => u.isActive).length}
          </div>
          <div className="flex -space-x-2 mt-4">
            {users.filter(u => u.isActive).slice(0, 3).map(u => (
              <div key={u.id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-black shadow-sm ${getColor(u.role)}`}>
                {getInitials(u.name)}
              </div>
            ))}
            {users.filter(u => u.isActive).length > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-sidebar flex items-center justify-center text-[9px] text-white font-black shadow-sm">
                +{users.filter(u => u.isActive).length - 3}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 bg-brand-sidebar p-6 rounded-xl shadow-2xl flex items-center justify-between border border-brand-teal/30 relative overflow-hidden group">
          <div className="w-full max-w-md relative z-10">
            <div className="font-sans text-[10px] font-black tracking-[0.2em] text-brand-green uppercase mb-2">Account Distribution</div>
            <div className="font-sans text-4xl font-black text-white flex items-end gap-3 leading-none">
              {meta.total} <span className="text-[10px] text-brand-green font-black uppercase tracking-widest mb-1.5 bg-brand-green/10 px-3 py-1 rounded-full border border-brand-green/20">Total</span>
            </div>
            <div className="w-full bg-white/5 h-2.5 rounded-full mt-6 overflow-hidden border border-white/5">
              <div
                className="bg-brand-green h-full shadow-[0_0_12px_rgba(136,194,65,0.4)]"
                style={{ width: meta.total > 0 ? `${(users.filter(u => u.isActive).length / Math.max(users.length, 1)) * 100}%` : '0%' }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">{users.filter(u => u.isActive).length} of {users.length} on this page active</p>
          </div>
          <div className="hidden md:block opacity-5 group-hover:opacity-10 transition-all scale-150 relative z-0">
            <TrendUp size={80} color="#88c241" weight="fill" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-surface-border rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-6 shadow-sm">
        <div className="relative flex-1 group">
          <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-green transition-colors" weight="bold" />
          <input 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-surface-border rounded-lg font-sans text-sm font-semibold text-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-green outline-none transition-all" 
            placeholder="Search by name, email, or agency identifier..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 flex-1">
            <span className="font-sans text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Role</span>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="flex-1 bg-slate-50 border border-surface-border rounded-lg px-4 py-3 font-sans text-xs font-black uppercase tracking-widest text-brand-teal outline-none focus:ring-2 focus:ring-brand-green transition-all cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="DISPATCHER">Dispatcher</option>
              <option value="WATCHER">Watcher</option>
              <option value="PARTNER">Partner</option>
            </select>
          </div>
          <div className="flex items-center gap-3 flex-1">
            <span className="font-sans text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Agency</span>
            <select
              value={agencyFilter}
              onChange={e => { setAgencyFilter(e.target.value); setCurrentPage(1); }}
              className="flex-1 bg-slate-50 border border-surface-border rounded-lg px-4 py-3 font-sans text-xs font-black uppercase tracking-widest text-brand-teal outline-none focus:ring-2 focus:ring-brand-green transition-all cursor-pointer"
            >
              <option value="ALL">All Agencies</option>
              {agencies?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <button 
            onClick={() => addNotification({ type: 'info', title: 'Filters', message: 'Advanced filter menu opened.' })}
            className="p-3 bg-white border border-surface-border rounded-xl hover:bg-brand-teal hover:text-white text-slate-400 transition-all shadow-sm flex items-center justify-center"
          >
            <Faders size={22} weight="bold" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
        {/* Table */}
        <div className="flex-[3] bg-white rounded-xl shadow-sm border border-surface-border overflow-hidden flex flex-col min-h-[500px]">
          <div className="overflow-x-auto flex-1 hide-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                <div className="w-12 h-12 border-4 border-brand-teal/20 border-t-brand-teal rounded-full animate-spin"></div>
                <p className="font-black text-xs text-brand-teal uppercase tracking-widest animate-pulse">Accessing Personnel Files...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-surface-border">
                    <th className="px-8 py-5 font-sans text-[10px] font-black tracking-[0.2em] text-slate-text uppercase">Personnel</th>
                    <th className="px-8 py-5 font-sans text-[10px] font-black tracking-[0.2em] text-slate-text uppercase">Operational Role</th>
                    <th className="px-8 py-5 font-sans text-[10px] font-black tracking-[0.2em] text-slate-text uppercase">Assigned Agency</th>
                    <th className="px-8 py-5 font-sans text-[10px] font-black tracking-[0.2em] text-slate-text uppercase">Status</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                           <ShieldCheck size={48} weight="duotone" className="text-slate-200" />
                           <p className="font-bold text-sm text-slate-400 uppercase tracking-widest">No personnel records found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                      <tr key={u.id} className="hover:bg-brand-green/5 transition-all group cursor-default">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs shadow-sm ${getColor(u.role)}`}>
                              {getInitials(u.name)}
                            </div>
                            <div>
                              <div className="font-black text-brand-teal text-sm uppercase tracking-tight">{u.name}</div>
                              <div className="font-bold text-[11px] text-slate-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="bg-brand-green/10 text-brand-green px-3 py-1.5 rounded-full font-black text-[10px] border border-brand-green/20 uppercase tracking-widest shadow-sm">
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="font-bold text-sm text-brand-teal uppercase tracking-tight">{(u as any).agency?.name || 'Unknown'}</div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <span className={`w-2.5 h-2.5 rounded-full ${u.isActive ? 'bg-brand-green animate-pulse' : 'bg-status-danger'}`}></span>
                            <span className={`font-black text-[11px] uppercase tracking-widest ${u.isActive ? 'text-brand-teal' : 'text-status-danger'}`}>{u.isActive ? 'Active' : 'Deactivated'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => addNotification({ type: 'info', title: 'User Actions', message: `Editing actions for ${u.name}` })}
                            className="p-3 rounded-xl hover:bg-white text-slate-400 hover:text-brand-teal transition-all shadow-sm border border-transparent hover:border-surface-border"
                          >
                            <DotsThreeVertical size={24} weight="bold" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination */}
          <div className="bg-slate-50 px-4 sm:px-8 py-5 border-t border-surface-border flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="font-bold text-[11px] text-slate-400 uppercase tracking-widest text-center sm:text-left">
              Showing {users.length} of {meta.total} personnel
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-surface-border hover:bg-white hover:text-brand-teal disabled:opacity-30 text-slate-400 transition-all shadow-sm"
              >
                <CaretLeft size={20} weight="bold" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
                  <button 
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-9 h-9 rounded-lg font-black text-xs transition-all ${currentPage === p ? 'bg-brand-teal text-white shadow-md' : 'hover:bg-white border border-transparent hover:border-surface-border text-slate-500'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={currentPage === meta.totalPages}
                className="p-2 rounded-lg border border-surface-border hover:bg-white hover:text-brand-teal disabled:opacity-30 text-slate-400 transition-all shadow-sm"
              >
                <CaretRight size={20} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        {/* Side Panel Widgets */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="bg-slate-50 rounded-xl p-8 border border-surface-border shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <div className="bg-brand-teal/10 p-2 rounded-lg">
                  <MagicWand size={22} weight="bold" className="text-brand-teal" />
                </div>
               <h4 className="font-sans text-xl font-black text-brand-teal uppercase tracking-tight">Directives</h4>
            </div>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => addNotification({ type: 'success', title: 'Exporting...', message: 'Personnel roster downloading.' })}
                className="flex items-center justify-between p-5 bg-white rounded-xl hover:shadow-lg transition-all text-brand-teal border border-surface-border group"
              >
                <span className="font-black text-[11px] uppercase tracking-widest group-hover:text-brand-green transition-colors">Export Tactical Roster</span>
                <Download size={22} weight="bold" className="text-slate-300 group-hover:text-brand-green transition-colors" />
              </button>
              <button 
                onClick={() => addNotification({ type: 'info', title: 'Audit Log', message: 'Opening system audit trail.' })}
                className="flex items-center justify-between p-5 bg-white rounded-xl hover:shadow-lg transition-all text-brand-teal border border-surface-border group"
              >
                <span className="font-black text-[11px] uppercase tracking-widest group-hover:text-brand-green transition-colors">Audit Integrity Log</span>
                <ClockCounterClockwise size={22} weight="bold" className="text-slate-300 group-hover:text-brand-green transition-colors" />
              </button>
              <button 
                onClick={() => addNotification({ type: 'info', title: 'Bulk Update', message: 'Bulk role modification wizard started.' })}
                className="flex items-center justify-between p-5 bg-white rounded-xl hover:shadow-lg transition-all text-brand-teal border border-surface-border group"
              >
                <span className="font-black text-[11px] uppercase tracking-widest group-hover:text-brand-green transition-colors">Bulk Credentialing</span>
                <MagicWand size={22} weight="bold" className="text-slate-300 group-hover:text-brand-green transition-colors" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-brand-teal/30 bg-brand-sidebar shadow-2xl flex-1 min-h-[250px] group p-8 flex flex-col justify-between">
            <div>
              <div className="font-sans text-[10px] font-black tracking-[0.2em] text-brand-green uppercase mb-2">System Info</div>
              <div className="font-sans text-2xl font-black text-white uppercase tracking-tight">NMS Operations</div>
              <p className="font-sans text-xs font-bold text-slate-400 mt-4 leading-relaxed uppercase tracking-wide">
                {meta.total} registered personnel across {agencies?.length ?? 1} {agencies?.length === 1 ? 'agency' : 'agencies'}.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Active</p>
                <p className="text-2xl font-black text-brand-green">{users.filter(u => u.isActive).length}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Inactive</p>
                <p className="text-2xl font-black text-status-danger">{users.filter(u => !u.isActive).length}</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-all scale-150">
              <ShieldCheck size={120} weight="fill" className="text-white" />
            </div>
          </div>
        </div>
      </div>
      
      <AddPersonnelModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
