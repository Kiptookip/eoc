import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function RoleGuard({ allowed, children }: { allowed: string[]; children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.user?.role);

  // Not logged in at all → send to login
  if (!token) return <Navigate to="/login" replace />;

  // Token exists but role not loaded yet → wait (don't redirect to login!)
  if (!role) return null;

  // Logged in but wrong role → show unauthorized
  if (!allowed.includes(role)) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}
