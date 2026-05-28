import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Role } from '../../types/api';

const ROLE_ROUTES: Record<Role, string> = {
  SUPER_ADMIN: '/admin/users',
  ADMIN: '/admin/users',
  DISPATCHER: '/dashboard',
  WATCHER: '/watcher/new-incident',
  PARTNER: '/partner/dashboard',
  DRIVER: '/driver/dashboard',
  EMT: '/emt/dashboard',
  NURSE: '/nurse/dashboard',
};

const ROLE_COLORS: Record<Role, string> = {
  SUPER_ADMIN: 'bg-purple-600',
  ADMIN: 'bg-brand-teal',
  DISPATCHER: 'bg-status-info',
  WATCHER: 'bg-status-warning',
  PARTNER: 'bg-brand-green',
  DRIVER: 'bg-orange-600',
  EMT: 'bg-red-600',
  NURSE: 'bg-pink-600',
};

export default function DevRoleSwitcher() {
  const [open, setOpen] = useState(false);
  const [pendingNav, setPendingNav] = useState<string | null>(null);
  const { user, setRole } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (pendingNav) {
      navigate(pendingNav);
      setPendingNav(null);
    }
  }, [pendingNav, navigate]);

  if (!user) return null;

  const userRoles: Role[] =
    user.roles && user.roles.length > 0 ? user.roles : [user.role];

  const activeRole: Role = user.activeRole || user.role || userRoles[0];

  if (userRoles.length <= 1) return null;

  const switchTo = (role: Role) => {
    setRole(role);
    setOpen(false);
    setPendingNav(ROLE_ROUTES[role] || '/dashboard');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
      {open && (
        <div className="bg-[#1a2327] border border-brand-teal/30 rounded-2xl shadow-2xl p-4 flex flex-col gap-2 min-w-[220px]">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
            Switch Role Center
          </p>

          {userRoles.map((role) => (
            <button
              key={role}
              onClick={() => switchTo(role)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
                activeRole === role
                  ? `${ROLE_COLORS[role]} text-white shadow-md`
                  : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              {activeRole === role && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
              {role.replace('_', ' ')}
            </button>
          ))}

          <div className="border-t border-white/10 mt-1 pt-2">
            <p className="text-[9px] text-slate-600 uppercase tracking-widest text-center">
              Multi-role access enabled
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="bg-[#1a2327] border border-brand-teal/40 text-brand-green font-black text-[10px] uppercase tracking-widest px-4 py-3 rounded-2xl shadow-2xl hover:border-brand-green transition-all flex items-center gap-2"
      >
        <span className={`w-2 h-2 rounded-full ${ROLE_COLORS[activeRole]} animate-pulse`} />
        {activeRole.replace('_', ' ')}
        <span className="text-slate-500">{open ? '▲' : '▼'}</span>
      </button>
    </div>
  );
}