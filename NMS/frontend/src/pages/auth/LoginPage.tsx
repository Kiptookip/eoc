import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, EnvelopeSimple, Lock, SignIn } from '@phosphor-icons/react';
import api from '../../api/client';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  passwordRaw: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      const res = await api.post('/auth/login', { email: data.email, passwordRaw: data.passwordRaw });
      const result = res.data.data;
      setAuth(result.token, result.user);
      const role = result.user.role;

      if (['SUPER_ADMIN', 'ADMIN'].includes(role)) navigate('/admin/users');
      else if (role === 'DISPATCHER') navigate('/dashboard');
      else if (role === 'WATCHER') navigate('/watcher/new-incident');
      else if (role === 'PARTNER') navigate('/partner/dashboard');
      else navigate('/unauthorized');
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      setServerError(msg || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-5 bg-surface-page">
      <main className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-12 bg-surface-card rounded-lg shadow-sm overflow-hidden border border-surface-border">
        
        {/* Left Side (Image Area) */}
        <div className="hidden md:flex md:col-span-7 relative bg-brand-sidebar overflow-hidden">
          {/* Dark teal tint overlay to blend the B&W illustration into the brand palette */}
          <div className="absolute inset-0 z-10 bg-brand-sidebar/70"></div>
          <img
            alt="Access control security illustration"
            className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity"
            src="/login-bg.jpg"
          />
          <div className="relative z-20 p-8 flex flex-col justify-between h-full text-white">
            <div className="flex items-center gap-2">
              <Shield size={40} weight="fill" className="text-brand-green" />
              <span className="font-sans text-[24px] font-bold tracking-tight">NMS</span>
            </div>
            <div className="max-w-md">
              <h1 className="font-sans text-[32px] font-bold mb-4 leading-tight">
                Advanced Crisis Response Management
              </h1>
              <p className="font-sans text-base text-white/90">
                Authorized personnel only. Accessing this portal grants entry to the NMS Internal Emergency Operations Centre infrastructure and real-time response data.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-white/30"></div>
              <span className="font-sans text-[11px] font-bold tracking-widest text-white/60 uppercase">
                System Status: Optimal
              </span>
            </div>
          </div>
        </div>

        {/* Right Side (Form Area) */}
        <div className="col-span-1 md:col-span-5 flex flex-col p-8 md:p-10 justify-center bg-white">
          <div className="mb-8 text-center md:text-left">
            <div className="md:hidden flex justify-center mb-4">
              <Shield size={48} weight="fill" className="text-brand-green" />
            </div>
            <h2 className="font-sans text-[20px] font-bold text-brand-teal mb-1">
              Emergency Operations Centre
            </h2>
            <p className="font-sans text-sm text-slate-text">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {serverError && (
              <div className="bg-status-danger/10 border border-status-danger text-status-danger px-4 py-3 rounded text-sm">
                {serverError}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="block font-sans text-[11px] font-bold tracking-widest text-slate-text uppercase ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-text group-focus-within:text-brand-green transition-colors">
                  <EnvelopeSimple size={20} />
                </div>
                <input
                  {...register('email')}
                  className={`w-full h-12 pl-[44px] pr-4 bg-slate-50 border ${errors.email ? 'border-status-danger' : 'border-surface-border'} rounded-lg font-sans text-sm text-brand-teal placeholder:text-slate-text/50 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all`}
                  placeholder="e.g. dispatcher.04@nms.gov"
                  type="email"
                />
              </div>
              {errors.email && (
                <p className="text-status-danger text-xs mt-1 ml-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="font-sans text-[11px] font-bold tracking-widest text-slate-text uppercase">
                  Security Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-text group-focus-within:text-brand-green transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  {...register('passwordRaw')}
                  className={`w-full h-12 pl-[44px] pr-4 bg-slate-50 border ${errors.passwordRaw ? 'border-status-danger' : 'border-surface-border'} rounded-lg font-sans text-sm text-brand-teal placeholder:text-slate-text/50 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all`}
                  placeholder="••••••••••••"
                  type="password"
                />
              </div>
              {errors.passwordRaw && (
                <p className="text-status-danger text-xs mt-1 ml-1">{errors.passwordRaw.message}</p>
              )}
            </div>

            <button
              disabled={isSubmitting}
              className="w-full h-12 bg-brand-green hover:brightness-95 text-white font-sans text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transform disabled:opacity-70"
              type="submit"
            >
              <span>{isSubmitting ? 'AUTHENTICATING...' : 'SECURE LOGIN'}</span>
              <SignIn size={18} />
            </button>
          </form>

          <footer className="mt-auto pt-8">
            <div className="flex flex-col items-center gap-1 opacity-60">
              <p className="font-sans text-[11px] font-bold tracking-widest text-slate-text">
                ENCRYPTED PORTAL V4.2
              </p>
              <p className="font-sans text-[10px] text-slate-text">
                © {new Date().getFullYear()} NMS Internal Systems.
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
