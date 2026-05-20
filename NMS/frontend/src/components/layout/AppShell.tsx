import { Outlet, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ToastContainer from '../shared/ToastContainer';
import DevRoleSwitcher from '../dev/DevRoleSwitcher';
import { socket } from '../../lib/socket';
import { useNotificationStore } from '../../stores/notificationStore';
import { useAuthStore } from '../../stores/authStore';

export default function AppShell() {
  const { addNotification } = useNotificationStore();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!token || !user) return;

    socket.connect();

    // Join role and user rooms so backend can target this client
    socket.on('connect', () => {
      socket.emit('join:room', {
        userId: user.id,
        roles: [user.role],
      });
    });

    // If already connected when this effect runs (e.g. role switch), join immediately
    if (socket.connected) {
      socket.emit('join:room', {
        userId: user.id,
        roles: [user.role],
      });
    }

    socket.on('incident:new', (data) => {
      addNotification({
        type: 'warning',
        title: 'New Incident Submitted',
        message: `Incident #${data.id.substring(0, 4)} reported at ${data.locationName}.`,
      });
    });

    socket.on('fleet:offline', (data) => {
      addNotification({
        type: 'error',
        title: 'Vehicle Offline',
        message: `Unit ${data.id.substring(0, 4)} has gone offline unexpectedly.`,
      });
    });

    socket.on('task:assigned', (task: { id: string; vehicleId: string; incidentId: string }) => {
      addNotification({
        type: 'success',
        title: 'Crew Dispatched',
        message: `Task ${task.id.substring(0, 6)} — crew assigned and en route.`,
      });
    });

    return () => {
      socket.off('connect');
      socket.off('incident:new');
      socket.off('fleet:offline');
      socket.off('task:assigned');
    };
  }, [addNotification, token, user]);

  // Redirect to login if not authenticated - MUST BE AFTER ALL HOOKS
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-surface-page font-sans text-slate-text">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
        <TopBar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <DevRoleSwitcher />
      <ToastContainer />
    </div>
  );
}
