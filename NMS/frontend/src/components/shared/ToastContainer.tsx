import { X, Info, CheckCircle, WarningCircle, Warning } from '@phosphor-icons/react';
import { useNotificationStore } from '../../stores/notificationStore';

const iconMap = {
  info: <Info weight="fill" className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" size={24} />,
  success: <CheckCircle weight="fill" className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" size={24} />,
  warning: <Warning weight="fill" className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" size={24} />,
  error: <WarningCircle weight="fill" className="text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" size={24} />,
};

const borderMap = {
  info: 'border-blue-500/30',
  success: 'border-emerald-500/30',
  warning: 'border-amber-500/30',
  error: 'border-rose-500/30',
};

const glowMap = {
  info: 'shadow-[0_8px_30px_-5px_rgba(59,130,246,0.3)]',
  success: 'shadow-[0_8px_30px_-5px_rgba(52,211,153,0.3)]',
  warning: 'shadow-[0_8px_30px_-5px_rgba(251,191,36,0.3)]',
  error: 'shadow-[0_8px_30px_-5px_rgba(244,63,94,0.3)]',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 pointer-events-none w-96 max-w-[calc(100vw-3rem)]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`relative overflow-hidden pointer-events-auto flex items-start gap-4 p-4 rounded-xl border backdrop-blur-xl bg-slate-900/85 ${borderMap[toast.type]} ${glowMap[toast.type]} animate-in slide-in-from-bottom-5 fade-in duration-300 hover:scale-[1.02] transition-all`}
        >
          {/* Subtle gradient overlay for glass effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          
          <div className="shrink-0 mt-0.5 relative z-10">{iconMap[toast.type]}</div>
          <div className="flex-1 min-w-0 relative z-10">
            <p className="font-sans text-[15px] font-bold text-white tracking-wide">{toast.title}</p>
            <p className="font-sans text-sm text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-slate-400 hover:text-white hover:bg-slate-700/50 p-1.5 rounded-md transition-colors relative z-10"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
      ))}
    </div>
  );
}
